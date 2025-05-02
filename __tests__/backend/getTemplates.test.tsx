import { GET } from '../../src/app/api/db/templates/get/route';
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


describe('GET /api/db/templates/get', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns templateMappings if user found', async () => {
    const mockUser = { uid: 'abc123' };
    const mockTemplateMappings = ['draft1', 'draft2'];

    (getCurrentUser as Mock).mockResolvedValue(mockUser);
    (db.get as Mock).mockResolvedValue({
      exists: true,
      data: () => ({ templateMappings: mockTemplateMappings }),
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: mockTemplateMappings,
    });
  });

  it('returns 400 if user not found', async () => {
    (getCurrentUser as Mock).mockResolvedValue(null);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/No user found/);
  });

  it('returns 400 if user doc does not exist', async () => {
    const mockUser = { uid: 'abc123' };

    (getCurrentUser as Mock).mockResolvedValue(mockUser);
    (db.get as Mock).mockResolvedValue({ exists: false });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
