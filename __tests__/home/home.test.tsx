import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../../src/app/page'
import { mockRouter } from '../../vitest.setup'
import { expect, test } from 'vitest';

test('checking new draft buttons', () => {
  render(<Home />)

  const buttons = screen.getAllByTestId('new-draft-button');
  buttons.forEach((button) => {
    fireEvent.click(button)
  });

  expect(mockRouter.push).toHaveBeenCalledTimes(buttons.length);
});
