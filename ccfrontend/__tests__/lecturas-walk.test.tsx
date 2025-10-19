import * as React from 'react';

// Reuse the same set of mocks used by failing diagnostic runs
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

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
}));
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), query: { id: '1' } }),
}));
jest.mock('@/components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'mock-layout' }, children),
}));
jest.mock('@/lib/useAuth', () => ({
  __esModule: true,
  ProtectedRoute: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'protected' }, children),
}));
jest.mock('react-bootstrap', () => {
  const React = require('react');
  const Button = (props: any) =>
    React.createElement('button', props, props.children);
  const Form = (props: any) =>
    React.createElement('form', props, props.children);
  Form.Control = (props: any) => React.createElement('input', props);
  Form.Select = (props: any) =>
    React.createElement('select', props, props.children);
  Form.Text = (props: any) =>
    React.createElement('small', props, props.children);
  const InputGroup = (props: any) =>
    React.createElement('div', props, props.children);
  InputGroup.Text = (props: any) =>
    React.createElement('span', props, props.children);
  const Card = (props: any) =>
    React.createElement('div', props, props.children);
  Card.Header = (props: any) =>
    React.createElement('div', props, props.children);
  Card.Body = (props: any) => React.createElement('div', props, props.children);
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

// Prevent window.confirm modal blocking
// @ts-ignore
global.confirm = () => true;

function walkElement(element: any, path: string[] = [], findings: any[] = []) {
  if (!element || typeof element !== 'object') {
    return findings;
  }
  const type = element.type;
  if (type && typeof type === 'object') {
    findings.push({ path: path.join(' > '), type, keys: Object.keys(type) });
  }
  const props = element.props || {};
  const children = props.children;
  if (Array.isArray(children)) {
    children.forEach((ch, i) =>
      walkElement(ch, path.concat([`[${i}]`]), findings),
    );
  } else if (children) {
    walkElement(children, path.concat(['children']), findings);
  }
  return findings;
}

test('walk lecturas element tree to find object-typed element types', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Lecturas = require('../pages/medidores/[id]/lecturas').default;
  // Call the component function to obtain the React element tree without rendering to DOM
  const el = Lecturas();
  expect(el).toBeDefined();
  const findings = walkElement(el, ['Lecturas']);
  console.log('WALK-FINDINGS:', findings);
  // If there are findings, fail the test to draw attention and show console output
  if (findings.length > 0) {
    throw new Error(
      `Found object-typed element types: ${JSON.stringify(findings)}`,
    );
  }
});
