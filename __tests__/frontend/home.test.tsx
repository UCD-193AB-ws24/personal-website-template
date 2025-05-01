import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../../src/app/page'
import { mockRouter } from '../../vitest.setup'
import { expect, test } from 'vitest';

test('testing new draft buttons', () => {
  render(<Home />)

  const buttons = screen.getAllByTestId('new-draft-button');
  buttons.forEach((button) => {
    fireEvent.click(button)
  });

  expect(mockRouter.push).toHaveBeenCalledTimes(buttons.length);

  buttons.forEach((button, index) => {
    const expectedPath = "/login";
    expect(mockRouter.push.mock.calls[index][0]).toBe(expectedPath);
  });
});

test('ensuring nav bar is there', () => {
  render(<Home />)

  const navBar = screen.getByTestId('nav-bar');
  expect(navBar).toBeInTheDocument();
});