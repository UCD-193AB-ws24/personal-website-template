import { NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@firebase/firebaseAdmin';

// GET /api/user/username
// Returns the current signed in user's username
export async function GET() {
	const user = await getCurrentUser();
	if (user === null) {
		console.log('No current user');
		return null;
	}

	try {
		const userDoc = await db.collection('users').doc(user.uid).get();
		if (userDoc.exists) {
			return NextResponse.json<APIResponse<string>>({
				success: true,
				data: userDoc.data()?.username,
			});
		} else {
			throw new Error('User not found');
		}
	} catch (error: any) {
		console.log('Error fetching user data:', error.message);

		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
