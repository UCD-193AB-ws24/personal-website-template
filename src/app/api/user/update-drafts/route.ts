import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, db } from "@lib/firebase/firebaseAdmin";
import { APIResponse } from "@customTypes/apiResponse";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/user/update-drafts:
// Body: {
//   timestamp: number
//   name?: string,           // optional
//   templateNumber?: string  // optional
// }
// Update drafts with new id and creates a draft document
export async function POST(req: NextRequest) {
  try {
    const reqJson = await req.json();

    if (!reqJson.hasOwnProperty("timestamp")) {
      throw new Error("Invalid request");
    }

    // Get the timestamp
    const timestamp = reqJson["timestamp"];

    // Get the user who sent the request and their uid to get their user document
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }
    const userDoc = db.collection("users").doc(user.uid);

    // Append the timestamp to the user's to draftIds
    await userDoc.update({
      draftMappings: FieldValue.arrayUnion({
        id: timestamp,
        name: reqJson.name || "Untitled Draft",
      }),
    });

    let pages = [{ components: [], pageName: "Home" }];
    if (reqJson.hasOwnProperty("templateNumber")) {
      // Copy the template's pages into the draft
      const templateNumber = reqJson.templateNumber;

      const templatesRef = db.collection("templates");
      const templatesQuery = templatesRef.where(
        "templateNumber",
        "==",
        templateNumber,
      );

      const templatesSnapshot = await templatesQuery.get();
      if (templatesSnapshot.docs.length !== 0) {
        pages = templatesSnapshot.docs[0].data().pages;
      }
    }

    // Create the new draft
    const draftsRef = db.collection("drafts");
    await draftsRef.add({
      draftId: `${user.uid}-${timestamp}`,
      pages: pages,
    });

    return NextResponse.json<APIResponse<string>>({
      success: true,
      data: "Success",
    });
  } catch (error: any) {
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
