import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const {email, turnstileToken} = await request.json();

    if (!email || !turnstileToken) {
      return NextResponse.json({message: 'Email and security token are required.'}, {status: 400});
    }

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
    const resetRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email,
      }),
    });

    const resetData = await resetRes.json();

    if (!resetRes.ok) {
      if (resetData.error?.message === 'EMAIL_NOT_FOUND') {
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 400) + 200)); // Wait 200-600ms
        return NextResponse.json({message: 'If an account exists, a reset link has been sent.'});
      }

      throw new Error(resetData.error?.message || 'Failed to send reset email');
    }

    // Success path
    return NextResponse.json({message: 'If an account exists, a reset link has been sent.'});
  } catch (error: unknown) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({message: 'Unable to process request. Please try again later.'}, {status: 500});
  }
}
