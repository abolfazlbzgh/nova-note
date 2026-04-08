import {adminDb} from '@/libs/firebaseAdmin';
import {errorResponse, successResponse, withAuth} from '@/libs/server-api';
import {FieldValue} from 'firebase-admin/firestore';
import {DEFAULT_MAX_AI_USES, DEFAULT_MAX_NOTES} from '@/libs/constants';
import {Role} from '@/types/roles';
import {sanitizePlainText} from '@/libs/sanitize';

export const POST = withAuth([Role.USER, Role.SUPER_ADMIN], async (request, context, user) => {
  const path = new URL(request.url).pathname;

  try {
    const body = await request.json();
    const {imageUrl, draftText, enhancedText} = body;

    if (imageUrl && !imageUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      return errorResponse('Invalid image URL source.', 'VALIDATION_ERROR', 400, path);
    }
    if (!imageUrl) {
      return errorResponse('Image is required.', 'MISSING_IMAGE', 400, path);
    }

    if (draftText && draftText.length > 200) {
      return errorResponse('Draft text exceeds 200 characters limit.', 'VALIDATION_ERROR', 400, path);
    }

    if (enhancedText && enhancedText.length > 200) {
      return errorResponse('Enhanced text exceeds 200 characters limit.', 'VALIDATION_ERROR', 400, path);
    }

    const userDocRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    const maxNotes = userData?.maxNotes ?? DEFAULT_MAX_NOTES;

    const notesCountSnapshot = await adminDb.collection('notes').where('userId', '==', user.uid).count().get();

    const currentNotesCount = notesCountSnapshot.data().count;

    if (currentNotesCount >= maxNotes) {
      return errorResponse(`You have reached your maximum limit of ${maxNotes} notes.`, 'LIMIT_REACHED', 403, path);
    }

    const notePayload = {
      userId: user.uid,
      imageUrl,
      draftText: sanitizePlainText(String(draftText ?? '')),
      enhancedText: sanitizePlainText(String(enhancedText ?? '')),
      createdAt: FieldValue.serverTimestamp(),
    };

    const noteRef = await adminDb.collection('notes').add(notePayload);

    return successResponse({id: noteRef.id}, 'Note created successfully!', 201, path);
  } catch (error: unknown) {
    console.error('[CREATE_NOTE_ERROR]:', error);
    return errorResponse('Failed to create note.', 'INTERNAL_ERROR', 500, path);
  }
});

export const GET = withAuth([Role.USER, Role.SUPER_ADMIN], async (request, context, user) => {
  const path = new URL(request.url).pathname;

  try {
    const userDocRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    const maxNotes = userData?.maxNotes ?? DEFAULT_MAX_NOTES;
    const maxAiUses = userData?.maxAiUses ?? DEFAULT_MAX_AI_USES;
    const aiUses = userData?.aiUses ?? 0;

    const notesSnapshot = await adminDb.collection('notes').where('userId', '==', user.uid).get();

    const rawNotes = notesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl,
        draftText: sanitizePlainText(String(data.draftText ?? '')),
        enhancedText: sanitizePlainText(String(data.enhancedText ?? '')),
        createdAt: data.createdAt?.toDate()?.getTime() || 0,
      };
    });

    rawNotes.sort((a, b) => b.createdAt - a.createdAt);

    const notes = rawNotes.map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt).toISOString(),
    }));

    const stats = {
      notesUsed: notes.length,
      maxNotes,
      remainingNotes: Math.max(0, maxNotes - notes.length),
      aiUsesUsed: aiUses,
      maxAiUses,
      remainingAiUses: Math.max(0, maxAiUses - aiUses),
    };

    return successResponse({stats, notes}, 'Dashboard data fetched successfully', 200, path);
  } catch (error: unknown) {
    console.error('[FETCH_DASHBOARD_ERROR]:', error);
    return errorResponse('Failed to fetch dashboard data.', 'INTERNAL_ERROR', 500, path);
  }
});

export const DELETE = withAuth([Role.USER, Role.SUPER_ADMIN], async (request, context, user) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const id = url.searchParams.get('id');

  try {
    if (!id) {
      return errorResponse('Note ID is required.', 'MISSING_ID', 400, path);
    }

    const noteRef = adminDb.collection('notes').doc(id);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return errorResponse('Note not found.', 'NOT_FOUND', 404, path);
    }

    if (noteDoc.data()?.userId !== user.uid) {
      return errorResponse('Unauthorized to delete this note.', 'FORBIDDEN', 403, path);
    }

    await noteRef.delete();

    return successResponse(null, 'Note deleted successfully.', 200, path);
  } catch (error: unknown) {
    console.error('[DELETE_NOTE_ERROR]:', error);
    return errorResponse('Failed to delete note.', 'INTERNAL_ERROR', 500, path);
  }
});
