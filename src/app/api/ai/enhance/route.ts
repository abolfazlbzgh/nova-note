import {adminDb} from '@/libs/firebaseAdmin';
import {errorResponse, successResponse, withAuth} from '@/libs/server-api';
import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {FieldValue} from 'firebase-admin/firestore';
import {DEFAULT_MAX_AI_USES} from '@/libs/constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const POST = withAuth([], async (request, context, user) => {
  const path = new URL(request.url).pathname;

  try {
    const {draftText} = await request.json();

    if (!draftText || draftText.length > 200) {
      return errorResponse('Invalid text provided.', 'VALIDATION_ERROR', 400, path);
    }

    const userDocRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    const maxAiUses = userData?.maxAiUses ?? DEFAULT_MAX_AI_USES;
    const currentAiUses = userData?.aiUses ?? 0;

    if (currentAiUses >= maxAiUses) {
      return errorResponse(
        `You have reached your maximum limit of ${maxAiUses} AI enhancements.`,
        'LIMIT_REACHED',
        403,
        path
      );
    }

    const prompt = `
      You are an expert copywriter and grammar editor. 
      Fix the following text for grammar, spelling, and flow. Do not drastically change the original meaning.
      It MUST be under 200 characters.
      
      Draft Text: "${draftText}"
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseSchema: any = {
      description: 'Enhanced grammar text',
      type: SchemaType.OBJECT,
      properties: {
        enhancedText: {
          type: SchemaType.STRING,
          description: 'The corrected text under 200 characters.',
        },
      },
      required: ['enhancedText'],
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    await userDocRef.update({
      aiUses: FieldValue.increment(1),
    });

    return successResponse(parsedData, 'Text enhanced successfully.', 200, path);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Internal server error during AI generation.', errorMessage, 500, path);
  }
});
