import { GET } from '../../src/app/api/user/get-drafts/route';
import { afterEach, describe, it, expect, vi, Mock } from 'vitest';
import { getCurrentUser, db } from '@lib/firebase/firebaseAdmin';


// Mock dependencies
vi.mock('@lib/firebase/firebaseAdmin', () => ({
  getCurrentUser: vi.fn(),
  db: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    get: vi.fn(),
  },
}));


describe('GET /api/user/get-drafts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns draftMappings if user and doc exist', async () => {
    const mockUser = { uid: 'abc123' };
    const mockDraftMappings = ['draft1', 'draft2'];

    (getCurrentUser as vi.Mock).mockResolvedValue(mockUser);
    (db.get as vi.Mock).mockResolvedValue({
      exists: true,
      data: () => ({ draftMappings: mockDraftMappings }),
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: mockDraftMappings,
    });
  });

  it('returns 400 if user not found', async () => {
    (getCurrentUser as vi.Mock).mockResolvedValue(null);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/User not found/);
  });

  it('returns 400 if user doc does not exist', async () => {
    const mockUser = { uid: 'abc123' };

    (getCurrentUser as vi.Mock).mockResolvedValue(mockUser);
    (db.get as vi.Mock).mockResolvedValue({ exists: false });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
