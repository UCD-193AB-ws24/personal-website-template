import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@lib/firebase/firebaseAdmin';

// POST /api/admin/templates?templateName=string
// Saves components in request body
export async function POST(req: NextRequest) {
	try {
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

		const reqBody = await req.json();

		if (!('pages' in reqBody)) {
			throw new Error("No pages found in the request's body");
		}

		// Get the templateName
		const searchParams = req.nextUrl.searchParams;
		const templateName = searchParams.get('templateName');
		if (templateName === null) {
			throw new Error(
				"No templateName found in the request's query parameters"
			);
		}

		// Get the user who sent the request and their uid to query for
		// saved draft document
		const templatesRef = db.collection('templates');
		const query = templatesRef.where("templateName", "==", templateName);
		const snapshot = await query.get();
		const pagesArray = Object.values(reqBody.pages || {});

		if (snapshot.docs.length === 0) {
			// Create a new document if the user doesn't have any previous saves
			await templatesRef.add({
				templateName: templateName,
				pages: pagesArray,
			});
		} else {
			// Update existing document
			await templatesRef.doc(snapshot.docs[0].id).update({
				templateName: templateName,
				pages: pagesArray,
			});
		}

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
