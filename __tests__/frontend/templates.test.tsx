import { render, screen } from '@testing-library/react';
import Templates from '../../src/app/setupdraft/page';
import { expect, test } from 'vitest';


test('ensuring nav bar is there', () => {
    render(<Templates />)

    const navBar = screen.getByTestId('nav-bar');
    expect(navBar).toBeInTheDocument();
});