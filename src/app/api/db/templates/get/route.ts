import { NextResponse } from 'next/server';
import { APIResponse, TemplateMapping } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@lib/firebase/firebaseAdmin';

// GET /api/db/templates/get
// Retrieves the template mappings
export async function GET() {
	try {
		// Get the user who sent the request
		const user = await getCurrentUser();
		if (user === null) {
			throw new Error('No user found');
		}

		const templateMappings = await db
			.collection('templates')
			.doc('mappings')
			.get();
		if (!templateMappings.exists) {
			throw new Error("Couldn't find template mappings");
		}

		return NextResponse.json<APIResponse<TemplateMapping[]>>({
			success: true,
			data: templateMappings.data()?.templateMappings,
		});
	} catch (error: any) {
		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
