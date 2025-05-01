import { render, screen, fireEvent } from '@testing-library/react'
import Templates from '../../src/app/setupdraft/page'
import { mockRouter } from '../../vitest.setup'
import { expect, test } from 'vitest';


test('ensuring nav bar is there', () => {
    render(<Templates />)

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toBeInTheDocument();
});