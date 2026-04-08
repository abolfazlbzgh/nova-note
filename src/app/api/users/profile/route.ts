import {adminDb, adminAuth} from '@/libs/firebaseAdmin';
import {sanitizePlainText} from '@/libs/sanitize';
import {errorResponse, successResponse, withAuth} from '@/libs/server-api';
import {Role} from '@/types/roles';

export const PATCH = withAuth([Role.USER, Role.SUPER_ADMIN], async (request, context, user) => {
  const path = new URL(request.url).pathname;

  try {
    const {name, photoUrl} = await request.json();

    const authUpdatePayload: {displayName?: string; photoURL?: string} = {};
    const dbUpdatePayload: {name?: string; photoUrl?: string} = {};

    if (name) {
      authUpdatePayload.displayName = name;
      dbUpdatePayload.name = sanitizePlainText(String(name));
    }
    if (photoUrl && !photoUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      return errorResponse('Invalid image URL source.', 'VALIDATION_ERROR', 400, path);
    }

    if (photoUrl && photoUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      authUpdatePayload.photoURL = photoUrl;
      dbUpdatePayload.photoUrl = photoUrl;
    }

    if (Object.keys(authUpdatePayload).length > 0) {
      await adminAuth.updateUser(user.uid, authUpdatePayload);
      await adminDb.collection('users').doc(user.uid).update(dbUpdatePayload);
    }

    return successResponse(null, 'Profile updated successfully.', 200, path);
  } catch (error: unknown) {
    console.error('[UPDATE_PROFILE_ERROR]:', error);
    return errorResponse('Failed to update profile.', 'INTERNAL_ERROR', 500, path);
  }
});
