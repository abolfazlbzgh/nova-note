'use client';

import Link from 'next/link';
import {useAuth} from '@/context/AuthContext';
import {Sparkles, Image as ImageIcon, PenTool} from 'lucide-react';

export default function LandingPage() {
  const {user, loading} = useAuth();

  return (
    <div className="hero bg-base-100 min-h-[85vh] flex-col justify-start pt-12 md:pt-24">
      <div className="hero-content relative z-10 flex-col text-center">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
            Perfect Your Memories with <span className="text-primary">NovaNote</span>
          </h1>
          <p className="text-base-content/70 py-6 text-lg md:text-xl">
            Your private AI-powered journal. Upload your images and let our advanced AI instantly polish your rough
            drafts into perfect, grammatically flawless captions.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {loading ? (
              <span className="loading loading-spinner text-primary loading-lg"></span>
            ) : user ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg rounded-full px-10">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary btn-lg rounded-full px-10">
                  Get Started for Free
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg rounded-full px-10">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card bg-base-200/50 border-base-300 flex items-center border p-8 text-center shadow-sm">
            <div className="bg-primary/10 mb-4 rounded-full p-4">
              <ImageIcon className="text-primary h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Secure Uploads</h3>
            <p className="text-base-content/70">
              Store your personal photos and thoughts in a completely private vault.
            </p>
          </div>

          <div className="card bg-base-200/50 border-base-300 flex items-center border p-8 text-center shadow-sm">
            <div className="bg-secondary/10 mb-4 rounded-full p-4">
              <PenTool className="text-secondary h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Draft Freely</h3>
            <p className="text-base-content/70">
              Write down your raw thoughts quickly without worrying about making mistakes.
            </p>
          </div>

          <div className="card bg-base-200/50 border-base-300 flex items-center border p-8 text-center shadow-sm">
            <div className="bg-accent/10 mb-4 rounded-full p-4">
              <Sparkles className="text-accent h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">AI Polish</h3>
            <p className="text-base-content/70">
              Instantly enhance your grammar, fix spelling, and perfect your tone with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
