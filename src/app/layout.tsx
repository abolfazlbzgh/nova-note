import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

import {ThemeProvider} from '@/components/providers/ThemeProvider';
import {AuthProvider} from '@/context/AuthContext';
import {ToastProvider} from '@/context/ToastContext';
import {ModalProvider} from '@/context/ModalContext';
import QueryProvider from '@/context/QueryProvider';

import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NovaNote',
  description: 'Private dashboard for images and text',
};

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
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
