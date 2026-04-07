/* eslint-disable @typescript-eslint/no-explicit-any */
import {NextResponse} from 'next/server';
import {FieldValue} from 'firebase-admin/firestore';
import {adminAuth, adminDb} from '@/libs/firebaseAdmin';
import {Role} from '@/types/roles';

export async function POST(request: Request) {
  try {
    const {email, password, name, turnstileToken} = await request.json();

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: turnstileToken,
      }).toString(),
    });

    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({message: 'Security check failed. Are you a robot?'}, {status: 400});
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: Role.USER,
      createdAt: FieldValue.serverTimestamp(),
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: Role.USER,
    });

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    try {
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const textBody = `
🎉 *New User Registered!*
🏫 *Platform:* Nova Note
👤 *Name:* ${name}
📧 *Email:* ${email}
        `;

        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: textBody,
            parse_mode: 'Markdown',
          }),
        });
      }
    } catch (telegramError) {
      console.error('Failed to send notification:', telegramError);
    }

    return NextResponse.json({customToken});
  } catch (error: any) {
    console.error('Registration API Error:', error);

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({message: 'This email is already registered.'}, {status: 400});
    }

    return NextResponse.json({message: 'Registration failed. Please try again.'}, {status: 500});
  }
}
