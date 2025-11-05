import util from 'util';

import { render } from '@testing-library/react';
import React from 'react';

// Mocks that must be in place before requiring the page module
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({ push: () => {}, pathname: '/', query: {} }),
}));

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: any) => React.createElement('div', null, children),
}));

jest.mock('@/components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) => React.createElement('div', null, children),
}));

jest.mock('@/lib/useAuth', () => ({
  __esModule: true,
  ProtectedRoute: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
}));

// Use our manual react-bootstrap mock file for tests
jest.mock('react-bootstrap');

test('find offending object-type element without $$typeof', () => {
  const orig = React.createElement;
  // Patch createElement to log any non-string, non-function element types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (React as any).createElement = function patched(type: any, ...rest: any[]) {
    const ttypeof = typeof type;
    // React.Fragment is a symbol (Symbol(react.fragment)) and is a valid element type
    const isFragment = type === React.Fragment;
    if (ttypeof !== 'string' && ttypeof !== 'function' && !isFragment) {
      const dump = util.inspect(type, { depth: 4, colors: false });
      // throw immediately so Jest shows the offending value and stack
      throw new Error(
        `createElement called with non-function/non-string type: ${dump}`,
      );
    }
    return orig.apply(React, [type, ...rest]);
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Lecturas = require('../pages/medidores/[id]/lecturas').default;
    render(React.createElement(Lecturas));
  } finally {
    (React as any).createElement = orig;
  }
});

