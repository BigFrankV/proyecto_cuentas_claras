import { render } from '@testing-library/react';
import * as React from 'react';
jest.mock('@mui/icons-material', () => {
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
  default: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), query: { id: '1' } }),
}));
jest.mock('@/components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-layout' }, children),
}));
jest.mock('@/lib/useAuth', () => ({
  __esModule: true,
  ProtectedRoute: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'protected' }, children),
}));

jest.mock('react-bootstrap', () => {
  const createMockComponent = (tagName: string) => {
    const Component = (props: Record<string, unknown>) =>
      React.createElement(tagName, props, props.children as React.ReactNode);
    return Component;
  };

  const Button = createMockComponent('button');

  const Form = Object.assign(createMockComponent('form'), {
    // eslint-disable-next-line react/display-name
    Control: createMockComponent('input'),
    // eslint-disable-next-line react/display-name
    Select: createMockComponent('select'),
    // eslint-disable-next-line react/display-name
    Text: createMockComponent('small'),
  });

  const InputGroup = Object.assign(createMockComponent('div'), {
    // eslint-disable-next-line react/display-name
    Text: createMockComponent('span'),
  });

  const Card = Object.assign(createMockComponent('div'), {
    // eslint-disable-next-line react/display-name
    Header: createMockComponent('div'),
    // eslint-disable-next-line react/display-name
    Body: createMockComponent('div'),
  });

  const Badge = createMockComponent('span');
  const Row = createMockComponent('div');
  const Col = createMockComponent('div');

  const Modal = Object.assign(createMockComponent('div'), {
    // eslint-disable-next-line react/display-name
    Body: createMockComponent('div'),
  });

  const Alert = createMockComponent('div');

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

interface ElementFinding {
  path: string;
  type: unknown;
  keys: string[];
}

function walkElement(
  element: unknown,
  path: string[] = [],
  findings: ElementFinding[] = [],
): ElementFinding[] {
  if (!element || typeof element !== 'object') {
    return findings;
  }

  const elem = element as Record<string, unknown>;
  const type = elem.type;

  if (type && typeof type === 'object') {
    findings.push({
      path: path.join(' > '),
      type,
      keys: Object.keys(type as Record<string, unknown>),
    });
  }

  const props = elem.props as Record<string, unknown> | undefined;
  const children = props?.children;

  if (Array.isArray(children)) {
    children.forEach((ch, i) =>
      walkElement(ch, path.concat([`[${i}]`]), findings),
    );
  } else if (children) {
    walkElement(children, path.concat(['children']), findings);
  }

  return findings;
}

test('walk lecturas element tree to find object-typed element types', async () => {
  // Import the component dynamically to avoid issues with Next.js pages
  const { default: Lecturas } = await import('../pages/medidores/[id]/lecturas');
  // Render the component using React Testing Library to provide React context
  const { container } = render(<Lecturas />);
  expect(container).toBeDefined();
  const findings = walkElement(container.firstChild, ['Lecturas']);
  // eslint-disable-next-line no-console
  console.log('WALK-FINDINGS:', findings);
  // If there are findings, fail the test to draw attention and show console output
  if (findings.length > 0) {
    throw new Error(
      `Found object-typed element types: ${JSON.stringify(findings)}`,
    );
  }
});

