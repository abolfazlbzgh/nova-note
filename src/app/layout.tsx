import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

import {ThemeProvider} from '@/components/providers/ThemeProvider';
import {AuthProvider} from '@/context/AuthContext';
import {ToastProvider} from '@/context/ToastContext';
import {ModalProvider} from '@/context/ModalContext';
import QueryProvider from '@/context/QueryProvider';

import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
import ToastContainer from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'NovaNote | Perfect Your Memories with AI',
  description:
    'A secure, high-performance journal powered by AI. Write your raw thoughts, and let advanced AI instantly polish them into perfect, grammatically flawless captions.',
  authors: [{name: 'Abolfazl Bazghandi', url: 'https://www.byabolfazl.com/'}],
  creator: 'Abolfazl Bazghandi',
  openGraph: {
    title: 'NovaNote | AI-Powered Journal',
    description:
      'Your private, secure vault. Upload images and instantly polish your drafts into flawless memories using Gemini AI.',
    url: 'https://github.com/abolfazlbzgh/nova-note',
    siteName: 'NovaNote',
    images: [
      {
        url: '/icon.jpg',
        width: 1200,
        height: 630,
        alt: 'NovaNote App Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaNote | AI-Powered Journal',
    description: 'A secure, high-performance journal powered by AI.',
    images: ['/icon.jpg'],
  },
};
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-base-100 flex min-h-full flex-col">
        <QueryProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <ModalProvider>
                  <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                </ModalProvider>
              </AuthProvider>
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
