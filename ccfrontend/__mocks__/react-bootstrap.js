const React = require('react');

// Very small, safe mocks for react-bootstrap components used by the Lecturas page.
// Each exported component is a plain function component. Nested members (e.g. Card.Body,
// Form.Control, InputGroup.Text, Modal.Body) are also provided as function components
// because some code accesses them as properties on the import.

function make(name, tag = 'div') {
  const Comp = (props) => React.createElement(tag, props, props && props.children);
  Comp.displayName = `Mock${name}`;
  return Comp;
}

const Card = make('Card');
Card.Body = make('Card.Body');
Card.Header = make('Card.Header');

const Button = make('Button', 'button');
const Badge = make('Badge', 'span');

const Form = make('Form', 'form');
Form.Control = make('Form.Control', 'input');
Form.Select = make('Form.Select', 'select');
Form.Group = make('Form.Group', 'div');

const InputGroup = make('InputGroup');
InputGroup.Text = make('InputGroup.Text', 'span');

const Modal = make('Modal');
Modal.Body = make('Modal.Body');
Modal.Header = make('Modal.Header');

const Row = make('Row', 'div');
const Col = make('Col', 'div');

const Alert = make('Alert', 'div');

module.exports = {
  __esModule: true,
  Card,
  Button,
  Badge,
  Form,
  InputGroup,
  Modal,
  Row,
  Col,
  Alert,
};

// also provide a default export for any `import RB from 'react-bootstrap'` usages
module.exports.default = module.exports;
