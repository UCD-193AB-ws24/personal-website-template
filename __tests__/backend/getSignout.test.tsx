import { GET } from "../../src/app/api/auth/signout/route";
import { afterEach, describe, it, expect, vi, Mock } from "vitest";
import { cookies } from "next/headers";
import { revokeAllSessions } from "@lib/firebase/firebaseAdmin";

// Mock revokeAllSessions function from firebase
vi.mock("@lib/firebase/firebaseAdmin", () => ({
  revokeAllSessions: vi.fn(),
}));

// Mock cookies from headers
vi.mock("next/headers", () => {
  return {
    cookies: vi.fn(),
  };
});

describe("GET /api/auth/signout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sign out successfully", async () => {
    const mockSessionCookie = "mock-session-cookie";

    const mockDelete = vi.fn();

    // giving it 2 test cookies
    const mockGetAll = vi.fn().mockReturnValue([
      { name: "__session" },
      { name: "cookie2" },
    ]);

    const mockGet = vi.fn().mockReturnValue({ value: mockSessionCookie });

    // mocking all functions used from cookies
    (cookies as Mock).mockReturnValue({
      get: mockGet,
      getAll: mockGetAll,
      delete: mockDelete,
    });

    // returned value isn't used so resolved value can be undefined
    // just needs to make sure it is calling mocked version
    (revokeAllSessions as Mock).mockResolvedValue(undefined);

    const res = await GET();
    const json = await res.json();

    expect(mockGet).toHaveBeenCalledWith("__session");
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ name: "__session" }));
    expect(revokeAllSessions).toHaveBeenCalledWith(mockSessionCookie);
    expect(json).toEqual({
      success: true,
      data: "Signed out successfully.",
    });
  });

  it("session cookie is missing", async () => {

    // returning undefined mocks how session cookie is missing
    const mockGet = vi.fn().mockReturnValue(undefined);
    const mockGetAll = vi.fn();
    const mockDelete = vi.fn();

    // mocking all functions of cookies
    (cookies as Mock).mockReturnValue({
      get: mockGet,
      getAll: mockGetAll,
      delete: mockDelete,
    });

    const res = await GET();
    const json = await res.json();

    // return should be 400 since there is no session cookie
    expect(res.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: "Session not found.",
    });

    expect(mockDelete).not.toHaveBeenCalled();
    expect(revokeAllSessions).not.toHaveBeenCalled();
  });
});
