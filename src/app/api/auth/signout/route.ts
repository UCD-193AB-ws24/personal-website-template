import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { revokeAllSessions } from '@lib/firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';

// GET /api/auth/signout
// Destroys session cookie
export async function GET() {
	const reqCookies = await cookies();
	const sessionCookie = reqCookies.get('__session')?.value;

	if (!sessionCookie) {
		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: 'Session not found.' },
			{ status: 400 }
		);
	}

	reqCookies.delete('__session');

	await revokeAllSessions(sessionCookie);

	return NextResponse.json<APIResponse<string>>({
		success: true,
		data: 'Signed out successfully.',
	});
}
