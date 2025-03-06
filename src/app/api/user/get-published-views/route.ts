import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@customTypes/apiResponse";
import { db, getCurrentUser } from "@lib/firebase/firebaseAdmin";

// GET /api/user/get-published-views
// Returns the views of the published draft
export async function GET(req: NextRequest) {
  try {
    // get current user
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("User not found");
    }

    // Get the publishedDraftNumber
    const searchParams = req.nextUrl.searchParams;
    const publishedDraftNumber = searchParams.get("publishedDraftNumber");

    const draftsRef = db.collection("drafts");
    const draftQuery = draftsRef.where(
      "draftId",
      "==",
      `${user.uid}-${publishedDraftNumber}`,
    );

    const draftSnapshot = await draftQuery.get();

    if (draftSnapshot.docs.length === 0) {
      throw new Error("No draft found");
    }

    const draftData = draftSnapshot.docs[0].data();

    return NextResponse.json<APIResponse<string>>({
      success: true,
      data: draftData.views,
    });
  } catch (error: any) {
    console.log("Error fetching user data:", error.message);

    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
