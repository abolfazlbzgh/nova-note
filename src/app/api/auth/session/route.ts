// app/api/auth/session/route.ts
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const token = body.token;

  if (!token) {
    return NextResponse.json({error: 'No token provided'}, {status: 400});
  }

  // Set the Secure, HttpOnly Cookie
  const cookieStore = await cookies();
  cookieStore.set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return NextResponse.json({success: true});
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  return NextResponse.json({success: true});
}
