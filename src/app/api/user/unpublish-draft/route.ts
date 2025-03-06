import { NextResponse } from "next/server";
import { getCurrentUser, db } from "@lib/firebase/firebaseAdmin";
import { APIResponse } from "@customTypes/apiResponse";

// POST /api/user/unpublish-draft:
// Sets publishedDraftNumber to 0
export async function POST() {
  try {
    // Get the user who sent the request and their uid to get their user document
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }
    const userDoc = db.collection("users").doc(user.uid);

    // Update the publishedDaftNumber field
    await userDoc.update({
      publishedDraftNumber: 0,
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
