import {adminAuth} from '@/libs/firebaseAdmin';
import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const {email, password, turnstileToken} = await request.json();

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: turnstileToken,
      }).toString(),
    });

    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      console.error('Turnstile Error:', turnstileData['error-codes']);
      return NextResponse.json({message: 'Security check failed. Are you a robot?'}, {status: 400});
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInRes.json();

    if (!signInRes.ok) {
      return NextResponse.json({message: 'Invalid email or password.'}, {status: 400});
    }

    const customToken = await adminAuth.createCustomToken(signInData.localId);

    return NextResponse.json({customToken});
  } catch (error: unknown) {
    console.error('Login API Error:', error);
    return NextResponse.json({message: 'Login failed. Please try again.'}, {status: 500});
  }
}
