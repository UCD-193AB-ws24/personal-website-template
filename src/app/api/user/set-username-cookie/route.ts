import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@customTypes/apiResponse";

// POST /api/user/set-username-cookie:
// Body: {
//   username: string
// }
// Sets the username field in the session cookie
export async function POST(req: NextRequest) {
  try {
    const reqJson = await req.json();

    if (!reqJson.hasOwnProperty("username")) {
      throw new Error("Invalid request");
    }

    // Get the username
    const username = reqJson["username"];

    // Cache the new username in the session cookie
    const cookieStore = await cookies();
    cookieStore.set("username", username, { secure: true });

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
