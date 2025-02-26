import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db } from '@lib/firebase/firebaseAdmin';
import { ComponentItem } from '@customTypes/componentTypes';

// GET /api/db/draft/published-draft?username=string
// Returns saved components of a user's published draft
export async function GET(req: NextRequest) {
	try {
		// Get the username
		const searchParams = req.nextUrl.searchParams;
		const username = searchParams.get('username');
		if (username === null) {
			throw new Error(
				"No username found in the request's query parameters"
			);
		}

		// Get the uid of the corresponding username
		const usersRef = db.collection('users');
		const usersQuery = usersRef.where("username", "==", username);
		const usersSnapshot = await usersQuery.get();
		if (usersSnapshot.docs.length === 0) {
			throw new Error("No user found");
		}
		const uid = usersSnapshot.docs[0].id;

		if (!("publishedDraftNumber" in usersSnapshot.docs[0].data())) {
			throw new Error("No published draft found")
		}
		const publishedDraftNumber = usersSnapshot.docs[0].data().publishedDraftNumber;

		const draftsRef = db.collection('drafts');
		const draftQuery = draftsRef.where(
			'draftId',
			'==',
			`${uid}-${publishedDraftNumber}`
		);
		const draftSnapshot = await draftQuery.get();

		if (draftSnapshot.docs.length === 0) {
			throw new Error('No draft found');
		}

                const draftData = draftSnapshot.docs[0].data();

                const pages = draftData.pages.map((page: any) => ({
                  pageName: page.pageName,
                  components: page.components.map((c: ComponentItem) => ({
                    id: c.id,
                    type: c.type,
                    position: c.position!,
                    size: c.size!,
	            components: c?.components,
                    content: c?.content
                  })),
                }));

                return NextResponse.json<APIResponse<{ pages: typeof pages }>>({
			success: true,
			data: { pages },
		});
	} catch (error: any) {
		console.log('Error fetching data:', error.message);

		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
