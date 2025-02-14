import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';

// POST /api/auth/login:
// Creates and sets a session cookie for the user
export async function POST(req: NextRequest) {
	try {
		const reqBody = (await req.json()) as { idToken: string };
		console.log('reqBody:', reqBody);
		const idToken = reqBody.idToken;

		// This is how we can get the user's UID
		// const decodedToken = await auth.verifyIdToken(idToken);
		// const uid = decodedToken.uid;

		const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

		const sessionCookie = await createSessionCookie(idToken, { expiresIn });

		(await cookies()).set('__session', sessionCookie, {
			maxAge: expiresIn,
			httpOnly: true,
			secure: true,
		});

		return NextResponse.json<APIResponse<string>>({
			success: true,
			data: 'Signed in successfully.',
		});
	} catch (error: any) {
		console.log('Error: POST /api/auth/login:', error.message);

		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
