import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../../src/app/profile/page';
import Settings from '../../src/app/profile/settings/page';
import { mockRouter } from '../../vitest.setup';
import { expect, test, afterEach, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  mockRouter.push.mockClear(); // clear previous calls to push
});

test('testing new draft button navigates to /setupdraft', () => {
  render(<Profile />);

  const button = screen.getByTestId('new-draft-button');
  fireEvent.click(button);

  expect(mockRouter.push).toHaveBeenCalledTimes(1);
  expect(mockRouter.push).toHaveBeenCalledWith("/setupdraft");
});

test('ensuring nav bar is there', () => {
  render(<Profile />);
  const navBar = screen.getByTestId('nav-bar');
  expect(navBar).toBeInTheDocument();
});

test('settings button navigates to /profile/settings', () => {
  render(<Profile />);

  const button = screen.getByTestId('setting-btn');
  fireEvent.click(button);

  expect(mockRouter.push).toHaveBeenCalledTimes(1);
  expect(mockRouter.push).toHaveBeenCalledWith("/profile/settings");
});

test('ensuring nav bar is there (settings page)', () => {
  render(<Settings />);
  const navBar = screen.getByTestId('nav-bar');
  expect(navBar).toBeInTheDocument();
});
