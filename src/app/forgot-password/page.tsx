'use client';

import {useState, useRef} from 'react';
import Link from 'next/link';
import {Mail, ArrowLeft, Sparkles, CheckCircle2} from 'lucide-react';
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
    <div className="hero bg-base-100 selection:bg-primary/30 min-h-screen">
      <div className="hero-content w-full flex-col gap-10 px-4 lg:flex-row-reverse lg:gap-20">
        <div className="max-w-xl text-center lg:text-left">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Secure Account Recovery
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Regain Access.</h1>
          <p className="text-base-content/70 py-6 text-base leading-relaxed sm:text-lg">
            Enter the email address associated with your NovaNote account, and we will send you a secure link to get you
            back into your vault.
          </p>
        </div>

        <div className="card bg-base-200/50 border-base-300 w-full max-w-md shrink-0 border shadow-xl backdrop-blur-sm">
          <div className="card-body p-6 sm:p-10">
            {success ? (
              <div className="flex flex-col items-center space-y-6 py-4 text-center">
                <div className="bg-success/20 text-success flex h-16 w-16 items-center justify-center rounded-full">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-bold">Check Your Email</h3>
                  <p className="text-base-content/80 text-sm leading-relaxed">{success}</p>
                  <div className="border-warning/20 bg-warning/10 text-warning-content/80 mt-4 rounded-xl border p-4 text-xs">
                    <p>
                      <strong>Didn&apos;t receive it?</strong> Please check your spam or junk folder just in case it got
                      filtered by mistake.
                    </p>
                  </div>
                </div>
                <Link href="/login" className="btn btn-primary mt-2 w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Return to Log In
                </Link>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-center text-2xl font-bold">Reset Password</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-4">
                    <div className="form-control w-full">
                      <label className="label pb-1.5" htmlFor="email">
                        <span className="label-text text-base-content/90 font-semibold">Email Address</span>
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          className="input input-bordered bg-base-100 focus:border-primary focus:ring-primary w-full pl-10 focus:ring-1"
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
                        <Mail className="text-base-content/40 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
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
                        onExpire={() => {
                          setTurnstileToken(null);
                          turnstileRef.current?.reset();
                        }}
                        onError={() => setTurnstileToken(null)}
                        options={{theme: 'light', size: 'flexible'}}
                      />
                    </div>

                    {error && <div className="alert alert-error mt-2 rounded-lg py-3 text-sm shadow-sm">{error}</div>}

                    <button
                      className="btn btn-primary mt-4 w-full"
                      type="submit"
                      disabled={submitting || !turnstileToken}
                    >
                      {submitting ? <span className="loading loading-spinner loading-sm"></span> : 'Send Reset Link'}
                    </button>

                    <div className="mt-4 text-center">
                      <Link
                        href="/login"
                        className="text-base-content/70 hover:text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to Log In
                      </Link>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
