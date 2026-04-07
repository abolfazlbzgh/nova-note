/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {signInWithCustomToken} from 'firebase/auth';
import {auth} from '@/libs/firebaseConfig';
import {useAuth} from '@/context/AuthContext';
import {Eye, EyeOff, Check, X, ShieldCheck} from 'lucide-react';
import {Turnstile, type TurnstileInstance} from '@marsidev/react-turnstile';

type RegisterForm = {name: string; email: string; password: string; confirm: string};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
  general?: string;
};

export default function RegisterPage() {
  const {loading: authLoading} = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Password Logic
  const [criteria, setCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [strengthScore, setStrengthScore] = useState(0);

  useEffect(() => {
    const pwd = form.password;
    const rules = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    setCriteria(rules);
    const score = Object.values(rules).filter(Boolean).length;
    setStrengthScore(score);
  }, [form.password]);

  const handleChange = (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({...p, [key]: e.target.value}));
    if (errors[key]) setErrors((prev) => ({...prev, [key]: undefined}));
    if (errors.general) setErrors((prev) => ({...prev, general: undefined}));
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Full Name is required.';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (strengthScore < 5) {
      newErrors.password = 'Password is too weak. Please meet all requirements.';
      isValid = false;
    }

    if (form.password !== form.confirm) {
      newErrors.confirm = 'Passwords do not match.';
      isValid = false;
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions.';
      isValid = false;
    }

    if (!turnstileToken) {
      newErrors.general = 'Please verify you are human.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const {customToken} = data;
      if (!customToken) throw new Error('Registration successful, but login failed.');

      const userCred = await signInWithCustomToken(auth, customToken);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: idToken}),
      });

      router.replace('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrors({general: err.message || 'An unexpected error occurred.'});
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressColor = () => {
    if (strengthScore <= 2) return 'progress-error';
    if (strengthScore <= 4) return 'progress-warning';
    return 'progress-success';
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="hero bg-base-200 mt-[64px] flex min-h-screen items-center justify-center">
      <div className="hero-content w-full flex-col items-center justify-center gap-6 px-2 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-4xl">Create Account</h1>
          <p className="text-base-content/70 py-2 text-sm sm:text-base">Join Acapage to manage your portfolio.</p>
        </div>

        <div className="card bg-base-100 w-full max-w-md shadow-2xl">
          <div className="card-body p-3 sm:p-8">
            <form onSubmit={handleSubmit} noValidate>
              <fieldset className="fieldset w-full space-y-3">
                <div className="form-control w-full">
                  <label className="label pt-0 pb-1" htmlFor="name">
                    <span className="label-text text-xs font-medium sm:text-sm">Full Name</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`input input-bordered input-md w-full ${errors.name ? 'input-error' : ''}`}
                    placeholder="Dr. John Smith"
                    value={form.name}
                    onChange={handleChange('name')}
                    required
                  />
                  {errors.name && <span className="text-error mt-1 text-xs">{errors.name}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label pt-0 pb-1" htmlFor="email">
                    <span className="label-text text-xs font-medium sm:text-sm">Email</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`input input-bordered input-md w-full ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    required
                  />
                  {errors.email && <span className="text-error mt-1 text-xs">{errors.email}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label pt-0 pb-1" htmlFor="new-password">
                    <span className="label-text text-xs font-medium sm:text-sm">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      name="new-password"
                      autoComplete="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-bordered input-md w-full pr-10 ${
                        errors.password ? 'input-error' : form.password && strengthScore < 5 ? 'input-warning' : ''
                      }`}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange('password')}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-error mt-1 text-xs">{errors.password}</span>}

                  <div className="mt-2">
                    <progress
                      className={`progress h-1.5 w-full ${getProgressColor()}`}
                      value={strengthScore}
                      max="5"
                    ></progress>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-1 text-[11px] sm:grid-cols-2 sm:text-xs">
                    <Requirement met={criteria.length} label="8+ Characters" />
                    <Requirement met={criteria.upper} label="Uppercase (A-Z)" />
                    <Requirement met={criteria.lower} label="Lowercase (a-z)" />
                    <Requirement met={criteria.number} label="Number (0-9)" />
                    <Requirement met={criteria.special} label="Symbol (@#$)" />
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label pt-0 pb-1" htmlFor="confirm-password">
                    <span className="label-text text-xs font-medium sm:text-sm">Confirm Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      autoComplete="new-password"
                      type={showConfirm ? 'text' : 'password'}
                      className={`input input-bordered input-md w-full pr-10 ${errors.confirm ? 'input-error' : ''}`}
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={handleChange('confirm')}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirm && <span className="text-error mt-1 text-xs">{errors.confirm}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label mt-2 cursor-pointer items-center justify-start gap-2 p-0 sm:gap-3">
                    <input
                      type="checkbox"
                      className={`checkbox checkbox-sm shrink-0 ${errors.terms ? 'checkbox-error' : 'checkbox-primary'}`}
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({...prev, terms: undefined}));
                      }}
                    />
                    <span className="label-text flex-1 text-xs leading-tight sm:text-sm">
                      I agree to the{' '}
                      <Link href="/terms" target="_blank" className="link link-primary">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" className="link link-primary">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.terms && <div className="text-error mt-1 ml-7 text-xs sm:ml-8">{errors.terms}</div>}
                </div>

                <div className="flex w-full justify-center overflow-hidden py-2">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      if (errors.general === 'Please verify you are human.')
                        setErrors((prev) => ({...prev, general: undefined}));
                    }}
                    onExpire={() => {
                      setTurnstileToken(null);
                      turnstileRef.current?.reset();
                    }}
                    onError={() => setTurnstileToken(null)}
                    options={{theme: 'light', size: 'flexible'}}
                  />
                </div>

                {errors.general && (
                  <div className="alert alert-error w-full justify-center rounded-lg px-3 py-2 text-sm">
                    {errors.general}
                  </div>
                )}

                <button className="btn btn-neutral mt-2 w-full" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      Create Account <ShieldCheck className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>
              </fieldset>
            </form>

            <div className="divider text-base-content/40 my-3 text-xs">OR</div>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="link link-hover text-primary font-medium">
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Requirement({met, label}: {met: boolean; label: string}) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-colors duration-300 ${met ? 'text-success' : 'text-base-content/40'}`}
    >
      {met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
      <span className="truncate">{label}</span>
    </div>
  );
}
