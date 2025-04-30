import { render, screen, fireEvent } from '@testing-library/react'
import SavedDrafts from '../src/app/saveddrafts/page'
import { mockRouter } from '../vitest.setup'
import { expect, test } from 'vitest';

test('testing buttons are there', () => {
  render(<SavedDrafts />)

  const newDraftBtn = screen.getAllByTestId('new-draft-btn');
  expect(newDraftBtn).toHaveLength(1);

  const templateBtn = screen.getAllByTestId('select-template-btn');
  expect(templateBtn).toHaveLength(1);
});

test('ensuring nav bar is there', () => {
    render(<SavedDrafts />)

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toBeInTheDocument();
});