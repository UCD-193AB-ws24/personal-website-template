import { NextResponse, NextRequest } from "next/server";
import { APIResponse } from "@customTypes/apiResponse";
import { db, getCurrentUser } from "@lib/firebase/firebaseAdmin";

// GET /api/user/draft-name?id={number}
// Returns the current signed in user's username
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("User not found");
    }

    // Get the draft mapping's id
    const searchParams = req.nextUrl.searchParams;
    const idStr = searchParams.get("id");
    if (idStr === null) {
      throw new Error("No id found in the request's query parameters");
    }
    const id = parseInt(idStr);

    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists) {
      const mapping = userDoc
        .data()
        ?.draftMappings.find(
          (mapping: { id: number; name: string }) => mapping.id === id,
        );
      console.log("draftmappings", userDoc.data()?.draftMappings);
      console.log("mapping", mapping);
      console.log("id", id);

      return NextResponse.json<APIResponse<string>>({
        success: true,
        data: mapping?.name,
      });
    } else {
      throw new Error("User not found");
    }
  } catch (error: any) {
    console.log("Error fetching user data:", error.message);

    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
