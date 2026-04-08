# NovaNote

NovaNote is a secure, high-performance, AI-powered journaling app.

Users can:
- Upload and optimize images
- Write rough personal drafts
- Instantly enhance grammar and tone with AI

This repository is built for open-source collaboration and production-grade full-stack practices.

## Live Demo

Try NovaNote here: https://nova-note-beta.vercel.app/

## Highlights

- Optimized media pipeline with client-side crop + compression
- AI text enhancement with Google Gemini
- Firebase-backed auth, database, and storage
- Quota-aware limits for notes and AI enhancements
- Clean dashboard UX with React Query caching
- Built-in theme system with both light and dark modes
- Security-focused stack: Turnstile + sanitization + protected API routes

## Resume-Oriented Engineering Highlights

This project demonstrates practical, production-focused full-stack skills:
- End-to-end product development (UI, API, auth, storage, and deployment)
- Security-first design with bot protection, input sanitization, and protected server routes
- Performance-minded implementation (client media optimization, query caching, modern Next.js architecture)
- Clean component architecture with reusable UI layers and centralized app state providers
- Real-world third-party integration (Firebase, Gemini AI, Turnstile, Vercel)

## UI and UX

- Responsive design for desktop and mobile
- Two visual themes: light mode and dark mode
- Accessible, component-driven UI built with DaisyUI + Tailwind CSS
- Smooth user feedback via toasts, modals, loading states, and optimistic interactions

## Tech Stack

- Frontend: Next.js 16.2 (App Router), React 19, Tailwind CSS 4, DaisyUI
- Data layer: TanStack React Query
- Auth/DB/Storage: Firebase + Firebase Admin
- AI: Google Gemini (`@google/generative-ai`)
- Security: Cloudflare Turnstile, DOMPurify
- Media: `react-easy-crop`, `browser-image-compression`

## Project Structure

```text
src/
	app/
		api/
			ai/enhance/
			auth/
			notes/
			users/profile/
		dashboard/
		login/
		register/
		forgot-password/
	components/
		auth/
		layout/
		providers/
		ui/
	context/
	libs/
	types/
```

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase project (Auth, Firestore, Storage)
- Google AI API key (Gemini)
- Cloudflare Turnstile site + secret keys

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` and add required variables:

```env

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GEMINI_API_KEY=

# Optional: registration notifications
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

3. Run development server:

```bash
npm run dev
```

App runs on `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start local dev server on port 3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format TS/JS files with Prettier

## Security Notes

- Never commit real secrets (`.env*` is ignored by default).
- Rotate all keys before deployment if they were ever exposed.
- Keep Firebase Admin credentials server-side only.
- Turnstile verification is enforced in auth-related API routes.
- User-generated text is sanitized before submission on the client.

## Firebase Requirements

At minimum, configure:
- Firebase Authentication (email/password)
- Firestore database
- Firebase Storage bucket
- Service account credentials for server routes using Admin SDK

If you publish this repository, include your Firestore and Storage rules files and deployment steps.

## Deployment Checklist

- Set all production environment variables
- Verify Firebase rules are locked down
- Ensure Turnstile site keys match production domain
- Run:

```bash
npm run lint
npm run build
```

- Disable verbose logging in production

## Product Positioning

NovaNote focuses on speed, security, and writing quality:
- Speed: lightweight uploads, query caching, responsive dashboard
- Security: protected APIs, anti-bot checks, sanitized text input
- Writing quality: AI-assisted grammar and tone enhancement

## Architecture Overview

- App Router based Next.js application with server API endpoints under `src/app/api`
- Firebase client SDK for frontend auth/storage flows
- Firebase Admin SDK for privileged server-side operations
- Shared API response helpers and auth middleware for consistent backend behavior
- React Query for cache management and request lifecycle handling on the client

## Roadmap Ideas

- Add pagination and advanced filtering for notes
- Add admin analytics dashboard
- Add test coverage (unit + integration + e2e)
- Add CI workflow for lint/build/test checks on pull requests

## Contributing

Issues and pull requests are welcome.

Before opening a PR:
- Keep changes focused and minimal
- Follow existing code style
- Run lint/build locally

## License

Choose and add a license file before final public release (for example, MIT).
