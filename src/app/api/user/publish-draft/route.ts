import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, db } from '@lib/firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';

// POST /api/user/publish-draft:
// Set publishedDraftNumber
export async function POST(req: NextRequest) {
	try {
		const reqJson = await req.json();

		if (!reqJson.hasOwnProperty('draftNumber')) {
			throw new Error('Invalid request');
		}

		// Get the draft number
		const draftNumber = reqJson['draftNumber'];

		// Get the user who sent the request and their uid to get their user document
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error('No user found');
		}
		const userDoc = db.collection('users').doc(user.uid);

		// Update the publishedDaftNumber field
		await userDoc.update({
			publishedDraftNumber: draftNumber,
		});

		return NextResponse.json<APIResponse<string>>({
			success: true,
			data: 'Success',
		});
	} catch (error: any) {
		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}

// GET /api/user/publish-draft:
// Returns the publishedDraftNumber of the user
export async function GET() {
	try {
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error('User not found');
		}

		const userDoc = await db.collection('users').doc(user.uid).get();
		if (userDoc.exists) {
			return NextResponse.json<APIResponse<string>>({
				success: true,
				data: userDoc.data()?.publishedDraftNumber || 0,
			});
		} else {
			throw new Error("Requested document does not exist");
		}
	} catch (error: any) {
		console.log('Error fetching user data:', error.message);

		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
