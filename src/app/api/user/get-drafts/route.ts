import { NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@lib/firebase/firebaseAdmin';

// GET /api/user/get-drafts
// Returns ids and names of all drafts of user
export async function GET() {
	try {
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error("User not found");
		}

		const userDoc = await db.collection('users').doc(user.uid).get();
		if (userDoc.exists) {
			return NextResponse.json<APIResponse<string>>({
				success: true,
				data: userDoc.data()?.draftMappings,
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
