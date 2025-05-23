import { POST } from "../../src/app/api/auth/login/route";
import { afterEach, describe, it, expect, vi, Mock } from "vitest";
import { createSessionCookie } from "@lib/firebase/firebaseAdmin";
import { cookies } from "next/headers";

// Mock createSessionCookie function from firebase
vi.mock("@lib/firebase/firebaseAdmin", () => ({
  createSessionCookie: vi.fn(),
}));

// Mock cookies from next/headers
vi.mock("next/headers", () => {
  return {
    cookies: vi.fn(),
  };
});

// creates a mock request to post
function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as any;
}

describe("POST /api/auth/login", () => {
  // this is to make sure all tests are independent of each other
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets a session cookie and returns success", async () => {
    const mockIdToken = "mock-id-token";
    const mockSessionCookie = "mock-session-cookie";

    // mocking set function from cookies()
    const mockSet = vi.fn();

    (createSessionCookie as Mock).mockResolvedValue(mockSessionCookie);
    (cookies as Mock).mockReturnValue({
      set: mockSet,
    });

    const req = createMockRequest({ idToken: mockIdToken });
    const response = await POST(req);
    const json = await response.json();

    // checking if expiresIn is set in the cookie
    expect(createSessionCookie).toHaveBeenCalledWith(
      mockIdToken,
      expect.objectContaining({ expiresIn: expect.any(Number) })
    );

    // checking if cookie is set with session cookie
    expect(mockSet).toHaveBeenCalledWith(
      "__session",
      mockSessionCookie,
      expect.objectContaining({ httpOnly: true })
    );

    // should return json response for successful request
    expect(json).toEqual({
      success: true,
      data: "Signed in successfully.",
    });
  });

  it("returns 400 on error", async () => {
    // creating an error reponse
    (createSessionCookie as Mock).mockRejectedValue(new Error("Invalid token"));
    (cookies as Mock).mockReturnValue({
      set: vi.fn(),
    });

    const req = createMockRequest({ idToken: "bad-token" });
    const response = await POST(req);
    const json = await response.json();

    // expecting error response since error is returned
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);

    // should return error message that includes "Invalid token"
    expect(json.error).toMatch(/Invalid token/);
  });
});
