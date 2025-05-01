import { render, screen, fireEvent } from '@testing-library/react'
import LogInForm from '../../src/app/login/loginForm'
import SignUpForm from '../../src/app/signup/signupForm'

import { expect, test } from 'vitest';

test('login buttons', () => {
    render(<LogInForm />)

    const buttons = screen.getAllByTestId('log-in-btn');
    expect(buttons).toHaveLength(2);
});

test('signup buttons', () => {
    render(<SignUpForm />)

    const buttons = screen.getAllByTestId('sign-up-btn');
    expect(buttons).toHaveLength(2);
});