/* eslint-disable react/display-name */
import React from 'react';

// Mirror the mocks used in lecturas.test but do not import the page or render anything.
jest.mock('@mui/icons-material', () => {
  const React = require('react');
  const icons = {
    PhotoCamera: () => React.createElement('span', null, 'photo-camera'),
    Edit: () => React.createElement('span', null, 'edit'),
    Photo: () => React.createElement('span', null, 'photo'),
    Save: () => React.createElement('span', null, 'save'),
    Clear: () => React.createElement('span', null, 'clear'),
    Assessment: () => React.createElement('span', null, 'assessment'),
    FileDownload: () => React.createElement('span', null, 'file-download'),
    PlaylistAddCheck: () =>
      React.createElement('span', null, 'playlist-add-check'),
    ArrowBack: () => React.createElement('span', null, 'arrow-back'),
  };
  return { __esModule: true, ...icons, default: icons };
});

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) => (
    <div data-testid='mock-layout'>{children}</div>
  ),
}));

jest.mock('@/lib/useAuth', () => ({
  __esModule: true,
  ProtectedRoute: ({ children }: any) => (
    <div data-testid='protected'>{children}</div>
  ),
}));

jest.mock('react-bootstrap', () => {
  const React = require('react');
  const Card = (props: any) =>
    React.createElement('div', props, props.children);
  Card.Header = (props: any) =>
    React.createElement('div', props, props.children);
  Card.Body = (props: any) => React.createElement('div', props, props.children);

  const Button = (props: any) =>
    React.createElement('button', props, props.children);

  const Form = (props: any) =>
    React.createElement('form', props, props.children);
  Form.Group = (props: any) =>
    React.createElement('div', props, props.children);
  Form.Label = (props: any) =>
    React.createElement('label', props, props.children);
  Form.Text = (props: any) =>
    React.createElement('small', props, props.children);
  Form.Control = (props: any) => {
    const { as, children, ...rest } = props || {};
    if (as === 'textarea')
      {return React.createElement('textarea', rest, children);}
    if (props && props.as === 'select')
      {return React.createElement('select', rest, children);}
    return React.createElement('input', rest);
  };
  Form.Select = (props: any) =>
    React.createElement('select', props, props.children);

  const InputGroup = (props: any) =>
    React.createElement('div', props, props.children);
  InputGroup.Text = (props: any) =>
    React.createElement('span', props, props.children);

  const Badge = (props: any) =>
    React.createElement('span', props, props.children);
  const Row = (props: any) => React.createElement('div', props, props.children);
  const Col = (props: any) => React.createElement('div', props, props.children);

  const Modal = (props: any) =>
    React.createElement('div', props, props.children);
  Modal.Body = (props: any) =>
    React.createElement('div', props, props.children);

  const Alert = (props: any) =>
    React.createElement('div', props, props.children);

  return {
    __esModule: true,
    Card,
    Button,
    Form,
    InputGroup,
    Badge,
    Row,
    Col,
    Modal,
    Alert,
  };
});

test('inspect mocks shapes', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const icons = require('@mui/icons-material');
  // eslint-disable-next-line no-console
  console.log('DEBUG-MOCK: icons keys=', Object.keys(icons));
  // eslint-disable-next-line no-console
  console.log(
    'DEBUG-MOCK: PlaylistAddCheck type=',
    typeof icons.PlaylistAddCheck,
    'defaultExists=',
    !!icons.default,
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rb = require('react-bootstrap');
  // eslint-disable-next-line no-console
  console.log('DEBUG-MOCK: react-bootstrap keys=', Object.keys(rb));
  // eslint-disable-next-line no-console
  console.log(
    'DEBUG-MOCK: Button type=',
    typeof rb.Button,
    'Form.Control type=',
    typeof (rb.Form && rb.Form.Control),
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const LayoutMod = require('@/components/layout/Layout');
  // eslint-disable-next-line no-console
  console.log('DEBUG-MOCK: Layout default type=', typeof LayoutMod.default);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useAuthMod = require('@/lib/useAuth');
  // eslint-disable-next-line no-console
  console.log(
    'DEBUG-MOCK: ProtectedRoute type=',
    typeof useAuthMod.ProtectedRoute,
  );

  expect(true).toBe(true);
});
