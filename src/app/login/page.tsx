'use client';

import {useState, useRef, Suspense} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {signInWithCustomToken} from 'firebase/auth';
import {auth} from '@/libs/firebaseConfig';
import {useAuth} from '@/context/AuthContext';
import {Eye, EyeOff, LogIn, UserPlus, Sparkles} from 'lucide-react';
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
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="hero bg-base-100 selection:bg-primary/30 min-h-screen">
      <div className="hero-content w-full flex-col gap-10 px-4 lg:flex-row-reverse lg:gap-20">
        <div className="max-w-xl text-center lg:text-left">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Welcome back to NovaNote
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Perfect Your <br className="hidden lg:block" />
            Memories.
          </h1>
          <p className="text-base-content/70 py-6 text-base leading-relaxed sm:text-lg">
            Access your private vault. Upload your images, jot down your rough thoughts, and let our advanced AI
            instantly polish them into perfect, grammatically flawless captions.
          </p>
        </div>

        <div className="card bg-base-200/50 border-base-300 w-full max-w-md shrink-0 border shadow-xl backdrop-blur-sm">
          <div className="card-body p-6 sm:p-10">
            <h2 className="mb-6 text-center text-2xl font-bold">Sign In</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-4">
                <div className="form-control w-full">
                  <label className="label pb-1.5" htmlFor="email">
                    <span className="label-text text-base-content/90 font-semibold">Email Address</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input input-bordered bg-base-100 focus:border-primary focus:ring-primary w-full focus:ring-1"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-control w-full">
                  <div className="flex items-center justify-between pb-1.5">
                    <label className="label p-0" htmlFor="password">
                      <span className="label-text text-base-content/90 font-semibold">Password</span>
                    </label>
                    <Link href="/forgot-password" className="text-primary text-xs font-medium hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input input-bordered bg-base-100 focus:border-primary focus:ring-primary w-full pr-12 focus:ring-1"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange('password')}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2 transition-colors focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex w-full justify-center overflow-hidden rounded-lg">
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

                {error && <div className="alert alert-error mt-2 rounded-lg py-3 text-sm shadow-sm">{error}</div>}

                <button className="btn btn-primary mt-4 w-full" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Log In
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="divider text-base-content/40 my-6 text-xs font-medium tracking-wider uppercase">OR</div>

            <div className="text-base-content/70 text-center text-sm">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-primary inline-flex items-center gap-1 font-bold hover:underline">
                Create Account <UserPlus className="h-3.5 w-3.5" />
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
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
