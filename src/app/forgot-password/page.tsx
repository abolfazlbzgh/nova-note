'use client';

import {useState, useRef} from 'react';
import Link from 'next/link';
import {Mail, ArrowLeft} from 'lucide-react';
import {Turnstile, type TurnstileInstance} from '@marsidev/react-turnstile';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!turnstileToken) {
      setError('Please verify you are human.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: email,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setSuccess(data.message);
      setEmail('');
      setTurnstileToken(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }

      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero bg-base-200 flex min-h-screen items-center justify-center">
      <div className="hero-content w-full flex-col px-2">
        <div className="mb-4 max-w-xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Reset Password</h1>
          <p className="text-base-content/70 py-4 text-sm sm:text-base">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body p-3 sm:p-8">
            {success ? (
              <div className="space-y-4 text-center">
                <div className="alert alert-success text-sm">
                  <span>{success}</span>
                </div>
                <Link href="/login" className="btn btn-outline w-full">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="fieldset w-full space-y-3">
                  <div className="form-control w-full">
                    <label className="label" htmlFor="email">
                      <span className="label-text font-medium">Email Address</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        className="input input-bordered w-full pl-10"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        required
                        autoComplete="email"
                        disabled={submitting}
                      />
                      <Mail className="text-base-content/30 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="mt-6 flex w-full justify-center overflow-hidden">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                      onSuccess={(token) => {
                        setTurnstileToken(token);
                        if (error === 'Please verify you are human.') setError(null);
                      }}
                      onExpire={() => {
                        setTurnstileToken(null);
                        turnstileRef.current?.reset();
                      }}
                      onError={() => setTurnstileToken(null)}
                      options={{theme: 'light', size: 'flexible'}}
                    />
                  </div>

                  {error && <p className="text-error mt-4 text-center text-sm font-medium">{error}</p>}

                  <button
                    className="btn btn-neutral mt-6 w-full"
                    type="submit"
                    disabled={submitting || !turnstileToken}
                  >
                    {submitting ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <div className="mt-4 text-center">
                    <Link href="/login" className="link link-hover flex items-center justify-center gap-2 text-sm">
                      <ArrowLeft className="h-4 w-4" /> Back to Login
                    </Link>
                  </div>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
