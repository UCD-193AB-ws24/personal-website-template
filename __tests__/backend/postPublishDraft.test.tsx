import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "../../src/app/api/db/drafts/published-draft/route";
import { db } from "@lib/firebase/firebaseAdmin";
import { NextRequest } from "next/server";

// Mock
vi.mock("@lib/firebase/firebaseAdmin", () => ({
  db: {
    collection: vi.fn(),
  },
}));

describe("GET /api/db/drafts/published-draft", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("user and draft exist", async () => {
    const username = "testuser";
    const mockUid = "uid123";
    const publishedDraftNumber = 1;

    const mockUsersDoc = {
      id: mockUid,
      data: () => ({ username, publishedDraftNumber }),
    };

    const mockUsersSnapshot = {
      docs: [mockUsersDoc],
    };

    const draftPages = [
      {
        pageName: "Page 1",
        components: [
          {
            id: "testID",
            type: "testType",
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
            content: "test",
          },
        ],
      },
    ];

    const mockDraftDoc = {
      data: () => ({ pages: draftPages }),
    };

    const mockDraftSnapshot = {
      docs: [mockDraftDoc],
    };

    // Mock Firestore chaining
    const mockUsersQuery = { get: vi.fn().mockResolvedValue(mockUsersSnapshot) };
    const mockDraftsQuery = { get: vi.fn().mockResolvedValue(mockDraftSnapshot) };

    const mockUsersRef = { where: vi.fn().mockReturnValue(mockUsersQuery) };
    const mockDraftsRef = { where: vi.fn().mockReturnValue(mockDraftsQuery) };

    (db.collection as any).mockImplementation((collectionName: string) => {
      if (collectionName === "users") return mockUsersRef;
      if (collectionName === "drafts") return mockDraftsRef;
    });

    const url = new URL(`http://localhost/api/db/drafts/published-draft?username=${username}`);
    const req = {
      nextUrl: url,
    } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.pages).toHaveLength(1);
    expect(json.data.pages[0].pageName).toBe("Page 1");
    expect(json.data.pages[0].components[0].id).toBe("testID");
    expect(json.data.pages[0].components[0].type).toBe("testType");
    expect(json.data.pages[0].components[0].content).toBe("test");
  });

  it("username is missing", async () => {
    const url = new URL(`http://localhost/api/db/drafts/published-draft`);
    const req = {
      nextUrl: url,
    } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/No username/);
  });
});
