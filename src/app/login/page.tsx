'use client';

import {useState, useRef, Suspense} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {signInWithCustomToken} from 'firebase/auth';
import {auth} from '@/libs/firebaseConfig';
import {useAuth} from '@/context/AuthContext';
import {Eye, EyeOff, LogIn, UserPlus} from 'lucide-react';
import {Turnstile, type TurnstileInstance} from '@marsidev/react-turnstile';

type LoginFormType = {email: string; password: string};

function LoginForm() {
  const {loading: authLoading} = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<LoginFormType>({email: '', password: ''});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Widget Reference
  const turnstileRef = useRef<TurnstileInstance>(null);

  const rawRedirect = searchParams.get('redirect');
  const redirectTo = rawRedirect && rawRedirect.startsWith('/') ? rawRedirect : '/dashboard';

  const handleChange = (key: keyof LoginFormType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({...p, [key]: e.target.value}));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!turnstileToken) {
      setError('Please verify you are human.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const {customToken} = data;

      if (!customToken) {
        throw new Error('Login successful, but secure token was missing.');
      }

      const userCred = await signInWithCustomToken(auth, customToken);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: idToken}),
      });

      router.replace(redirectTo);
    } catch (err: unknown) {
      let message = 'Login failed. Please try again.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);

      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content w-full flex-col gap-8 px-2 lg:flex-row-reverse lg:gap-16">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-3xl font-bold sm:text-5xl">Welcome back!</h1>
          <p className="text-base-content/80 py-6 text-sm sm:text-base">
            Access your academic dashboard to manage your portfolio, track research progress, and coordinate with your
            team.
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body p-3 sm:p-8">
            <h2 className="card-title mb-4 justify-center text-2xl">Sign In</h2>

            <form onSubmit={handleSubmit} noValidate>
              <fieldset className="fieldset w-full space-y-3">
                <div className="form-control w-full">
                  <label className="label" htmlFor="email">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label" htmlFor="password">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input input-bordered w-full pr-10"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange('password')}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-1 text-right">
                    <Link
                      href="/forgot-password"
                      className="link link-hover text-base-content/60 hover:text-primary text-xs transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="flex w-full justify-center overflow-hidden py-2">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      if (error === 'Please verify you are human.') setError(null);
                    }}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => {
                      setTurnstileToken(null);
                      turnstileRef.current?.reset();
                    }}
                    options={{theme: 'light', size: 'flexible'}}
                  />
                </div>

                {error && (
                  <div className="alert alert-error w-full justify-center rounded-lg py-2 text-sm">{error}</div>
                )}

                <button className="btn btn-neutral mt-2 w-full" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </>
                  )}
                </button>
              </fieldset>
            </form>

            <div className="divider text-base-content/40 my-4 text-xs">OR</div>

            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="link link-hover text-primary inline-flex items-center gap-1 font-medium"
              >
                Create Account <UserPlus className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
