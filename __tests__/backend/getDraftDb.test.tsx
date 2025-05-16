import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "../../src/app/api/db/drafts/route";
import { db, getCurrentUser } from "@lib/firebase/firebaseAdmin";
import { NextRequest } from "next/server";

vi.mock("@lib/firebase/firebaseAdmin", () => ({
  db: {
    collection: vi.fn(),
  },
  getCurrentUser: vi.fn(),
}));

describe("GET /api/db/drafts?draftNumber=number", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("user and draft exist", async () => {
    const mockUid = "uid123";
    const draftNumber = 1;

    const mockUser = { uid: mockUid };
    const mockDraftData = { pages: [{ pageName: "Page 1" }] };

    const mockDraftSnapshot = {
      docs: [{ id: "draft1", data: () => mockDraftData }],
    };

    // Mock Firestore collection query
    const mockDraftsQuery = { where: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue(mockDraftSnapshot) }) };
    (db.collection as any).mockImplementation(() => mockDraftsQuery);
    (getCurrentUser as any).mockResolvedValue(mockUser);

    const url = new URL(`http://localhost/api/db/drafts?draftNumber=${draftNumber}`);
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockDraftData.pages);
  });

  it("draftNumber is missing", async () => {
    const url = new URL(`http://localhost/api/db/drafts`);
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/No draftNumber/);
  });

  it("returns 400 if no user found", async () => {
    const draftNumber = 1;
    (getCurrentUser as any).mockResolvedValue(null); // No user

    const url = new URL(`http://localhost/api/db/drafts?draftNumber=${draftNumber}`);
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/No user found/);
  });

  it("returns 400 if draft not found", async () => {
    const mockUser = { uid: "uid123" };
    const draftNumber = 1;

    const mockDraftSnapshot = { docs: [] }; // No drafts found
    const mockDraftsQuery = { where: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue(mockDraftSnapshot) }) };
    (db.collection as any).mockImplementation(() => mockDraftsQuery);
    (getCurrentUser as any).mockResolvedValue(mockUser);

    const url = new URL(`http://localhost/api/db/drafts?draftNumber=${draftNumber}`);
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/No draft found/);
  });
});
