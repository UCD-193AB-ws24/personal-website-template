import { render, screen, fireEvent } from '@testing-library/react';
import SetupDraft from '../../src/app/setupdraft/page';
import { mockRouter } from '../../vitest.setup';
import { expect, test } from 'vitest';

test('testing buttons', () => {
    render(<SetupDraft />)

    const newDraftBtn = screen.getByTestId('new-draft-btn');
    fireEvent.click(newDraftBtn);

    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push.mock.calls[0][0]).toBe("/login");

    const templateBtn = screen.getAllByTestId('select-template-btn');
    expect(templateBtn).toHaveLength(1);

});

test('ensuring nav bar is there', () => {
    render(<SetupDraft />)

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toBeInTheDocument();
});