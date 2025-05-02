import '@testing-library/jest-dom';
import { vi } from 'vitest';

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

// eventually change to admin user to test internal pages?
vi.mock('@lib/firebase/firebaseApp', () => {
    const mockUser = null;
  
    return {
      getFirebaseAuth: () => ({
        onAuthStateChanged: (_auth: any, callback: (user: any) => void) => {
            callback(mockUser);
            return () => {};
        },
        currentUser: mockUser,
      }),
      getFirebaseDB: () => ({}),
      getFirebaseStorage: () => ({}),
    };
  });

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));
