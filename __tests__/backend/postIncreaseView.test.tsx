import { POST } from "../../src/app/api/db/drafts/increase-view-count/route";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { db } from "@lib/firebase/firebaseAdmin";
import { NextRequest } from "next/server";

// Mocks
vi.mock("@lib/firebase/firebaseAdmin", () => ({
  db: {
    collection: vi.fn(),
  },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    increment: vi.fn((val) => ({ __increment: val })),
  },
}));

describe("POST /api/db/drafts/increase-view-count", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("increments the draft view count", async () => {
    const mockUpdate = vi.fn();
    const mockDocRef = { update: mockUpdate };
    const mockDraftSnapshot = {
      empty: false,
      docs: [{ ref: mockDocRef }],
    };

    const mockUsersDoc = {
      id: "user123",
      data: () => ({
        username: "testuser",
        publishedDraftNumber: 1,
      }),
    };

    const mockUsersSnapshot = {
      docs: [mockUsersDoc],
    };

    // Setup chained Firestore mock calls
    const mockDraftQuery = { get: vi.fn().mockResolvedValue(mockDraftSnapshot) };
    const mockUserQuery = { get: vi.fn().mockResolvedValue(mockUsersSnapshot) };

    const mockDraftsRef = { where: vi.fn().mockReturnValue(mockDraftQuery) };
    const mockUsersRef = { where: vi.fn().mockReturnValue(mockUserQuery) };

    (db.collection as any).mockImplementation((collectionName: string) => {
      if (collectionName === "users") return mockUsersRef;
      if (collectionName === "drafts") return mockDraftsRef;
    });

    // Simulate a NextRequest with ?username=testuser
    const url = new URL("http://localhost/api/db/drafts/increase-view-count?username=testuser");
    const req = {
      nextUrl: url,
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ views: { __increment: 1 } });
  });

  it("no username is provided", async () => {
    const url = new URL("http://localhost/api/db/drafts/increase-view-count");
    const req = {
      nextUrl: url,
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Error updating view");
  });
});
