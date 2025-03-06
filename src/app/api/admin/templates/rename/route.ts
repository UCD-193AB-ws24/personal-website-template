import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@customTypes/apiResponse";
import { db, getCurrentUser } from "@lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/admin/templates/rename
// Body: {
//   oldName: string,
//   newName: string,
//   number: number,
// }
// Updates the template mappings with the new name
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

    if (!("oldName" in reqBody)) {
      throw new Error("No oldName found in the request's body");
    } else if (!("newName" in reqBody)) {
      throw new Error("No newName found in the request's body");
    } else if (!("number" in reqBody)) {
      throw new Error("No number found in the request's body");
    }

    const oldName = reqBody.oldName;
    const newName = reqBody.newName;
    const number = reqBody.number;

    // Get the corresponding template document
    const templateMappingsRef = db.collection("templates").doc("mappings");

    // Remove the old mapping
    templateMappingsRef.update({
      templateMappings: FieldValue.arrayRemove({
        number: number,
        name: oldName,
      }),
    });

    // Add the new mapping
    templateMappingsRef.update({
      templateMappings: FieldValue.arrayUnion({
        number: number,
        name: newName,
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
