import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@lib/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/admin/templates/delete
// Body: {
//   name: string,
//   number: number,
// }
// Deletes the corresponding document in the templates collection
// and removes the entry from the template mappings
export async function POST(req: NextRequest) {
	try {
		// Get the user who sent the request
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error('No user found');
		}

		// User must be an admin account
		const userDoc = await db.collection('users').doc(user.uid).get();
		const username = userDoc.data()?.username;
		if (username !== 'admin') {
			throw new Error('Invalid credentials');
		}

		// Verify that the request's body contains all the necessary inputs
		const reqBody = await req.json();

		if (!('name' in reqBody)) {
			throw new Error("No name found in the request's body");
		} else if (!('number' in reqBody)) {
			throw new Error("No number found in the request's body");
		}

		const name = reqBody.name;
		const number = reqBody.number;

		// Get the corresponding template document
		const templatesRef = db.collection('templates');
		const templatesQuery = templatesRef.where(
			'templateId',
			'==',
			`${user.uid}-${number}`
		);
		const templatesSnapshot = await templatesQuery.get();
		templatesSnapshot.forEach((doc) => {
			doc.ref.delete();
		});

		// Remove the mapping
		const templateMappingsRef = templatesRef.doc('mappings');
		templateMappingsRef.update({
			templateMappings: FieldValue.arrayRemove({
				number: number,
				name: name,
			}),
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
