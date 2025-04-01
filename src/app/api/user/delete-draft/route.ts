import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, db } from '@lib/firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/user/delete-drafts:
// Deletes a draft given a draftId
export async function POST(req: NextRequest) {
	try {
		const reqJson = await req.json();

		if (!reqJson.hasOwnProperty('draftObj')) {
			throw new Error('Invalid request');
		}

		// Get the draft mapping
		const draftObj = reqJson['draftObj'];
		if (
			!draftObj.hasOwnProperty('id') ||
			!draftObj.hasOwnProperty('name')
		) {
			throw new Error('Invalid request');
		}

		const id = parseInt(draftObj['id']);

		// Get the user who sent the request and their uid to get their user document
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error('No user found');
		}
		const userDoc = db.collection('users').doc(user.uid);

		// Delete the draftId from the user's doc and reset publishedDraftNumber if
		// the draft to be deleted is published
		const userDocData = (await userDoc.get()).data();
		if (userDocData?.publishedDraftNumber === id) {
			await userDoc.update({
				draftMappings: FieldValue.arrayRemove(draftObj),
				publishedDraftNumber: 0,
			});
		} else {
			await userDoc.update({
				draftMappings: FieldValue.arrayRemove(draftObj),
			});
		}

		// Delete the draft document
		const draftsRef = db.collection('drafts');
		const query = draftsRef.where(
			'draftId',
			'==',
			`${user.uid}-${draftObj.id}`
		);
		const snapshot = await query.get();
		snapshot.forEach((doc) => {
			doc.ref.delete();
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
