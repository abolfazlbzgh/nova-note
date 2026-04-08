'use client';

import Link from 'next/link';
import {useAuth} from '@/context/AuthContext';
import {
  Sparkles,
  Image as ImageIcon,
  PenTool,
  Code2 as GithubIcon,
  User,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Code2,
  Database,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const {user, loading} = useAuth();

  return (
    <div className="bg-base-100 min-h-screen">
      {/* Hero Section */}
      <div className="hero flex-col justify-center pt-16 pb-12 md:pt-28">
        <div className="hero-content relative z-10 flex-col px-4 text-center">
          {/* Open Source Badge */}
          <div className="bg-base-200 border-base-300 hover:border-primary/50 mb-8 inline-flex items-center gap-3 rounded-full border px-5 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-success relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              Open Source Project
            </span>
            <div className="bg-base-content/20 h-4 w-px"></div>
            <Link
              href="https://github.com/abolfazlbzgh/nova-note"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <GithubIcon className="h-4 w-4" /> GitHub
            </Link>
            <div className="bg-base-content/20 hidden h-4 w-px sm:block"></div>
            <Link
              href="https://www.byabolfazl.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary hidden items-center gap-1.5 transition-colors sm:flex"
            >
              <User className="h-4 w-4" /> By Abolfazl
            </Link>
          </div>

          <div className="max-w-4xl">
            <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight md:text-7xl">
              Perfect Your Memories <br className="hidden md:block" />
              with <span className="text-primary bg-primary/10 rounded-xl px-2">NovaNote</span>
            </h1>
            <p className="text-base-content/70 mx-auto max-w-2xl py-6 text-lg leading-relaxed md:text-2xl">
              A secure, high-performance journal powered by AI. Write your raw thoughts, and let advanced AI instantly
              polish them into perfect, grammatically flawless captions.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {loading ? (
                <span className="loading loading-spinner text-primary loading-lg"></span>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="btn btn-primary btn-lg shadow-primary/30 rounded-full px-10 shadow-lg"
                >
                  Go to Dashboard <Zap className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn btn-primary btn-lg shadow-primary/30 rounded-full px-10 shadow-lg"
                  >
                    Get Started for Free
                  </Link>
                  <Link href="/login" className="btn btn-outline btn-lg rounded-full px-10">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="bg-base-200/50 border-base-300 border-y px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Built for Speed and Creativity</h2>
            <p className="text-base-content/60 mt-4 text-lg">
              Focus on your memories. We handle the formatting and security.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card bg-base-100 border-base-300 border shadow-sm transition-shadow hover:shadow-md">
              <div className="card-body items-center p-8 text-center">
                <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Optimized Media</h3>
                <p className="text-base-content/70">
                  Client-side image cropping and compression (react-easy-crop & browser-image-compression) ensure fast,
                  lightweight uploads to Firebase Storage.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 border-base-300 border shadow-sm transition-shadow hover:shadow-md">
              <div className="card-body items-center p-8 text-center">
                <div className="bg-secondary/10 text-secondary mb-4 rounded-full p-4">
                  <PenTool className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Frictionless Drafting</h3>
                <p className="text-base-content/70">
                  Write freely. TanStack Query handles caching and background updates, providing a buttery-smooth,
                  optimistic UI experience.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 border-base-300 border shadow-sm transition-shadow hover:shadow-md">
              <div className="card-body items-center p-8 text-center">
                <div className="bg-accent/10 text-accent mb-4 rounded-full p-4">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Generative AI</h3>
                <p className="text-base-content/70">
                  Powered by Google Gemini 3.1 Flash. NovaNote intelligently restructures sentences and corrects grammar
                  in milliseconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack & Security Section (For Recruiters) */}
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/2">
            <div className="bg-base-200 mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
              <Code2 className="h-4 w-4" /> Developer Focused
            </div>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Enterprise-Grade Architecture</h2>
            <p className="text-base-content/70 mb-8 text-lg leading-relaxed">
              NovaNote is built with modern, industry-standard practices. It prioritizes data security, robust state
              management, and seamless performance, making it a highly scalable full-stack application.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-success/20 text-success mt-1 shrink-0 rounded-full p-1">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-base-content block">Bulletproof Security</strong>
                  <span className="text-base-content/70 text-sm">
                    Protected against XSS with DOMPurify, bot attacks with Cloudflare Turnstile, and secured by Firebase
                    HttpOnly Custom Token Auth.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-info/20 text-info mt-1 shrink-0 rounded-full p-1">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-base-content block">Serverless Backend</strong>
                  <span className="text-base-content/70 text-sm">
                    Utilizes Next.js 16.2 App Router with highly secure API routes interfacing directly with Firebase
                    Admin SDK.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-warning/20 text-warning mt-1 shrink-0 rounded-full p-1">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-base-content block">Strict Quota Management</strong>
                  <span className="text-base-content/70 text-sm">
                    Custom API middleware enforces strict Firestore document counts and AI generation limits per user.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 lg:w-1/2">
            <div className="bg-base-200 border-base-300 rounded-2xl border p-6">
              <span className="mb-1 block text-lg font-bold">Next.js 16</span>
              <span className="text-base-content/60 text-xs tracking-wider uppercase">Framework</span>
            </div>
            <div className="bg-base-200 border-base-300 rounded-2xl border p-6">
              <span className="mb-1 block text-lg font-bold">Tailwind 4</span>
              <span className="text-base-content/60 text-xs tracking-wider uppercase">Styling</span>
            </div>
            <div className="bg-base-200 border-base-300 rounded-2xl border p-6">
              <span className="mb-1 block text-lg font-bold">Firebase</span>
              <span className="text-base-content/60 text-xs tracking-wider uppercase">Auth & DB</span>
            </div>
            <div className="bg-base-200 border-base-300 rounded-2xl border p-6">
              <span className="mb-1 block text-lg font-bold">Gemini AI</span>
              <span className="text-base-content/60 text-xs tracking-wider uppercase">Machine Learning</span>
            </div>
            <div className="bg-base-200 border-base-300 rounded-2xl border p-6">
              <span className="mb-1 block text-lg font-bold">React Query</span>
              <span className="text-base-content/60 text-xs tracking-wider uppercase">Data Fetching</span>
            </div>
            <div className="bg-base-200 border-base-300 rounded-2xl border p-6">
              <span className="mb-1 block text-lg font-bold">DaisyUI</span>
              <span className="text-base-content/60 text-xs tracking-wider uppercase">Components</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="bg-primary text-primary-content mt-12 px-4 py-16 text-center">
        <h2 className="mb-6 text-3xl font-bold">Ready to see the code?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="https://github.com/abolfazlbzgh/nova-note"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-neutral btn-lg rounded-full px-8"
          >
            <GithubIcon className="mr-2 h-5 w-5" /> View on GitHub
          </Link>
          <Link
            href="https://www.byabolfazl.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline bg-primary-content text-primary hover:bg-primary-content/90 hover:text-primary btn-lg rounded-full border-none px-8"
          >
            <User className="mr-2 h-5 w-5" /> Hire Abolfazl
          </Link>
        </div>
      </div>
    </div>
  );
}
