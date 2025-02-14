import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@firebase/firebaseAdmin';
import { ComponentItem } from '@customTypes/componentTypes';

// GET /api/db/drafts
// Returns saved components
export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	const draftNumber = searchParams.get('draftNumber');

	const user = await getCurrentUser();
	if (user === null) {
    throw new Error("No user found");
	}

	try {
		const usersRef = db.collection('drafts');
		const query = usersRef.where(
			'draftId',
			'==',
			`${user.uid}-${draftNumber}`
		);
		const snapshot = await query.get();

    if (snapshot.docs.length === 0) {
      throw new Error("No drafts found");
    }

		const components = snapshot.docs[0].data();

		const data: ComponentItem[] = [];
		components.components.forEach((c: ComponentItem) => {
			data.push({
				id: c.id,
				type: c.type,
				position: c.initialPos!,
				size: c.initialSize!,
				components: c?.components,
				content: c?.content,
			});
		});

		return NextResponse.json<APIResponse<ComponentItem[]>>({
			success: true,
			data: data,
		});
	} catch (error: any) {
		console.log('Error fetching user data:', error.message);

		return NextResponse.json<APIResponse<string>>(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
