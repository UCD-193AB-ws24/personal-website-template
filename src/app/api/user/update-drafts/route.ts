import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, db } from '@lib/firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/user/update-drafts:
// Update drafts with new id
export async function POST(req: NextRequest) {
	try {
		const reqJson = await req.json();

		if (!reqJson.hasOwnProperty('timestamp')) {
			throw new Error('Invalid request');
		}

		// Get the timestamp
		const timestamp = reqJson['timestamp'];

		// Get the user who sent the request and their uid to get their user document
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error('No user found');
		}
		const userDoc = db.collection('users').doc(user.uid);

		// Append the timestamp to the user's to draftIds
		await userDoc.update({
			draftMappings: FieldValue.arrayUnion({
				id: timestamp,
				name: 'Untitled Draft',
			}),
		});

		// Create the new draft
		const draftsRef = db.collection('drafts');
		await draftsRef.add({
			draftId: `${user.uid}-${timestamp}`,
			pages: [{ components: [], pageName: 'Home' }],
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
