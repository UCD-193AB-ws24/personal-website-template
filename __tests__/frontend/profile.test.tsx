import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../../src/app/profile/page';
import Settings from '../../src/app/profile/settings/page';
import { mockRouter } from '../../vitest.setup';
import { expect, test } from 'vitest';

let calls = 0
let index = 0

test('testing new draft buttons', () => {
    render(<Profile />)

    const button = screen.getByTestId('new-draft-button');

    fireEvent.click(button);
    calls += 1;

    expect(mockRouter.push).toHaveBeenCalledTimes(calls);

    const expectedPath = "/setupdraft";
    expect(mockRouter.push.mock.calls[index][0]).toBe(expectedPath);
    index += 1;

});

test('ensuring nav bar is there', () => {
    render(<Profile />)

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toBeInTheDocument();
});


test('linked to settings', () => {
    render(<Profile />)

    const button = screen.getByTestId('setting-btn');
    fireEvent.click(button);
    calls += 1;;

    expect(mockRouter.push).toHaveBeenCalledTimes(calls);

    expect(mockRouter.push.mock.calls[index][0]).toBe("/profile/settings");
    index += 1;
})

test('ensuring nav bar is there (settings)', () => {
    render(<Settings />)

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toBeInTheDocument();
});