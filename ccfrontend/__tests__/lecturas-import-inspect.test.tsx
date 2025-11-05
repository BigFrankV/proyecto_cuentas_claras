/* Diagnostic test: inspect the shape of imports used by pages/medidores/[id]/lecturas.tsx
   This test should be run with jest --runInBand and will print typeof/keys for each symbol
   so we can locate any mock or import that resolves to an object instead of a component.
*/
/* eslint-disable no-console */
import * as React from 'react';

// Repeat minimal mocks used by previous tests so module loading is consistent.
jest.mock('@mui/icons-material', () => ({
  __esModule: true,
  PlaylistAddCheck: () =>
    React.createElement('span', null, 'Icon-PlaylistAddCheck'),
  Save: () => React.createElement('span', null, 'Icon-Save'),
  ArrowBack: () => React.createElement('span', null, 'Icon-ArrowBack'),
  PhotoCamera: () => React.createElement('span', null, 'Icon-PhotoCamera'),
  Edit: () => React.createElement('span', null, 'Icon-Edit'),
  Photo: () => React.createElement('span', null, 'Icon-Photo'),
  Clear: () => React.createElement('span', null, 'Icon-Clear'),
  Assessment: () => React.createElement('span', null, 'Icon-Assessment'),
  FileDownload: () => React.createElement('span', null, 'Icon-FileDownload'),
  default: {},
}));

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: any) => React.createElement('head', null, children),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' } }),
}));

jest.mock('@/components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'layout' }, children),
}));

jest.mock('@/lib/useAuth', () => ({
  __esModule: true,
  ProtectedRoute: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'protected' }, children),
}));

jest.mock('react-bootstrap', () => ({
  __esModule: true,
  Card: (props: any) => React.createElement('div', props, props.children),
  Button: (props: any) => React.createElement('button', props, props.children),
  Form: Object.assign(
    (props: any) => React.createElement('form', props, props.children),
    {
      Control: (p: any) => React.createElement('input', p),
      Select: (p: any) => React.createElement('select', p),
    }
  ),
  InputGroup: Object.assign(
    (p: any) => React.createElement('div', p, p.children),
    {
      Text: (p: any) => React.createElement('span', p, p.children),
    }
  ),
  Badge: (p: any) => React.createElement('span', p, p.children),
  Row: (p: any) => React.createElement('div', p, p.children),
  Col: (p: any) => React.createElement('div', p, p.children),
  Modal: Object.assign((p: any) => React.createElement('div', p, p.children), {
    Body: (p: any) => React.createElement('div', p, p.children),
  }),
  Alert: (p: any) => React.createElement('div', p, p.children),
}));

test('inspect imports used by lecturas page', async () => {
  // List of module paths and the names the page imports from each
  const importsToCheck: Array<{ module: string; names: string[] }> = [
    {
      module: '@mui/icons-material',
      names: [
        'PlaylistAddCheck',
        'Save',
        'ArrowBack',
        'PhotoCamera',
        'Edit',
        'Photo',
        'Clear',
        'Assessment',
        'FileDownload',
        'default',
      ],
    },
    { module: 'next/head', names: ['default'] },
    { module: 'next/router', names: ['useRouter'] },
    { module: '@/components/layout/Layout', names: ['default'] },
    { module: '@/lib/useAuth', names: ['ProtectedRoute'] },
    {
      module: 'react-bootstrap',
      names: [
        'Card',
        'Button',
        'Form',
        'InputGroup',
        'Badge',
        'Row',
        'Col',
        'Modal',
        'Alert',
      ],
    },
  ];

  for (const imp of importsToCheck) {
    // require the module and log keys/types
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(imp.module);
    console.log(
      'IMPORT-INSPECT:',
      imp.module,
      'export keys=',
      Object.keys(mod)
    );
    for (const name of imp.names) {
      const val = (mod as any)[name];
      console.log(
        `IMPORT-INSPECT: ${imp.module} -> ${name} typeof=`,
        typeof val,
        Array.isArray(val) ? 'array' : '',
        val && typeof val === 'object' ? Object.keys(val).slice(0, 10) : val
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const page = require('../pages/medidores/[id]/lecturas');
  // eslint-disable-next-line no-console
  console.log('LECTURAS PAGE keys', Object.keys(page));
  expect(page).toBeDefined();
});
