import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@customTypes/apiResponse';
import { db, getCurrentUser } from '@lib/firebase/firebaseAdmin';

// GET /api/db/drafts?draftNumber=number
// Returns saved components
export async function GET(req: NextRequest) {
  try {
    // Get the draftNumber
    const searchParams = req.nextUrl.searchParams;
    const draftNumber = searchParams.get('draftNumber');
    if (draftNumber === null) {
      throw new Error("No draftNumber found in the request's query parameters")
    }

    // Get the user who sent the request and their uid to query for
    // saved draft document
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }

    const draftsRef = db.collection('drafts');
    const query = draftsRef.where(
      'draftId',
      '==',
      `${user.uid}-${draftNumber}`
    );
    const snapshot = await query.get();

    if (snapshot.docs.length === 0) {
      throw new Error("No draft found");
    }

    const draftData = snapshot.docs[0].data();
    return NextResponse.json<APIResponse<typeof draftData.pages>>({
      success: true,
      data: draftData.pages || {},
    });
  } catch (error: any) {
    console.log('Error fetching user data:', error.message);
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/db/drafts?draftNumber=number
// Saves components in request body
export async function POST(req: NextRequest) {
  try {
    const reqJson = await req.json();

    // Get the draftNumber
    const searchParams = req.nextUrl.searchParams;
    const draftNumber = searchParams.get('draftNumber');
    if (draftNumber === null) {
      throw new Error("No draftNumber found in the request's query parameters")
    }

    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }

    // Get the user who sent the request and their uid to query for
    // saved draft document
    const draftsRef = db.collection('drafts');
    const query = draftsRef.where(
      'draftId',
      '==',
      `${user.uid}-${draftNumber}`
    );
    const snapshot = await query.get();
    const pagesArray = Object.values(reqJson.pages || {});

    if (snapshot.docs.length === 0) {
      // Create a new document if the user doesn't have any previous saves
      await draftsRef.add({
        draftId: `${user.uid}-${draftNumber}`,
        pages: pagesArray,
      })
    } else {
      // Update existing document
      await draftsRef.doc(snapshot.docs[0].id).update(
        {
          draftId: `${user.uid}-${draftNumber}`,
          pages: pagesArray,
        }
      )
    }

    return NextResponse.json<APIResponse<string>>({
      success: true, data: "Success"
    });
  } catch (error: any) {
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
