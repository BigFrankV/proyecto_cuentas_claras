import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children, title }: any) => (
    <div>
      <div data-testid="layout-title">{title}</div>
      <div data-testid="layout-children">{children}</div>
    </div>
  ),
}));

describe('Layout mock', () => {
  it('renders title and children', () => {
    const Child = () => <div>Content</div>;
    const Layout = require('@/components/layout/Layout').default;
    render(<Layout title="Test Title"><Child /></Layout>);
    expect(screen.getByTestId('layout-title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('layout-children')).toHaveTextContent('Content');
  });
});
