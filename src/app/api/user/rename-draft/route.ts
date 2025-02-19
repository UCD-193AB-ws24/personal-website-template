import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, db } from '@lib/firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';
import { FieldValue } from 'firebase-admin/firestore';


// POST /api/user/rename-drafts:
// Update draftMappings with new name
export async function POST(req: NextRequest) {
  try {
    const reqJson = await req.json();

    if (!reqJson.hasOwnProperty("number") || !reqJson.hasOwnProperty("oldName") || !reqJson.hasOwnProperty("newName")) {
      throw new Error("Invalid request");
    }

    // Get the timestamp
    const number = reqJson["number"];
    const oldName = reqJson["oldName"];
    const newName = reqJson["newName"];

    // Get the user who sent the request and their uid to get their user document
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }
    const userDoc = db.collection('users').doc(user.uid);

    // Remove old mapping
    await userDoc.update({
        draftMappings: FieldValue.arrayRemove({id: number, name: oldName })
    })

    // Append the new mapping
    await userDoc.update({
      draftMappings: FieldValue.arrayUnion(
        {
          id: number,
          name: newName
        }
      )
    });

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
