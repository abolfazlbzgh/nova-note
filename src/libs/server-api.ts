import {NextResponse} from 'next/server';
import {adminAuth} from '@/libs/firebaseAdmin';
import {DecodedIdToken} from 'firebase-admin/auth';
import {Role} from '@/types/roles';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  error?: string;
}

export function successResponse<T>(data: T, message = 'Success', statusCode = 200, path = '') {
  const response: ApiResponse<T> = {
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    path,
  };
  return NextResponse.json(response, {status: statusCode});
}

export function errorResponse(message: string, error?: string, statusCode = 400, path = '') {
  const response: ApiResponse<null> = {
    statusCode,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    path,
    error,
  };
  return NextResponse.json(response, {status: statusCode});
}

type AuthenticatedRouteHandler = (
  request: Request,
  context: Record<string, unknown>,
  user: DecodedIdToken
) => Promise<Response>;

export function withAuth(allowedRoles: Role[], handler: AuthenticatedRouteHandler) {
  return async (request: Request, context: Record<string, unknown>) => {
    const path = new URL(request.url).pathname;

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse('Missing or invalid authentication token.', 'UNAUTHORIZED', 401, path);
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await adminAuth.verifyIdToken(token);

      if (allowedRoles.length > 0) {
        const userRole = decodedToken.role as Role;
        if (!allowedRoles.includes(userRole)) {
          return errorResponse('Forbidden. Insufficient permissions.', 'FORBIDDEN', 403, path);
        }
      }

      return await handler(request, context, decodedToken);
    } catch (error: unknown) {
      console.error(`[Auth Middleware] Failed at ${path}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return errorResponse('Authentication failed or session expired.', errorMessage, 401, path);
    }
  };
}
