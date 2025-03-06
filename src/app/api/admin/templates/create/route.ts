import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@customTypes/apiResponse";
import { db, getCurrentUser } from "@lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/admin/templates/create
// Body: {
//   name: string,
//   number: number,
// }
// Copies the pages of the provided draft and creates a new document for
// the template in the templates collection
export async function POST(req: NextRequest) {
  try {
    // Get the user who sent the request
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }

    // User must be an admin account
    const userDoc = await db.collection("users").doc(user.uid).get();
    const username = userDoc.data()?.username;
    if (username !== "admin") {
      throw new Error("Invalid credentials");
    }

    // Verify that the request's body contains all the necessary inputs
    const reqBody = await req.json();

    if (!("name" in reqBody)) {
      throw new Error("No name found in the request's body");
    } else if (!("number" in reqBody)) {
      throw new Error("No number found in the request's body");
    }

    const name = reqBody.name;
    const number = reqBody.number;
    const timestamp = Date.now();

    // Get the pages from the draft
    const draftsRef = db.collection("drafts");
    const draftQuery = draftsRef.where(
      "draftId",
      "==",
      `${user.uid}-${number}`,
    );
    const draftSnapshot = await draftQuery.get();
    if (draftSnapshot.docs.length === 0) {
      throw new Error("No draft document found");
    }

    const pages = draftSnapshot.docs[0].data().pages;

    // Create a new document for the template
    const templatesRef = db.collection("templates");
    await templatesRef.add({
      pages: pages,
      templateNumber: timestamp,
    });

    // Update the template mappings document with the new template
    const templateMappingsRef = templatesRef.doc("mappings");
    templateMappingsRef.update({
      templateMappings: FieldValue.arrayUnion({
        number: timestamp,
        name: name,
      }),
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
