import { render } from '@testing-library/react';
import React from 'react';

// Reuse the same mocks as in lecturas.test.tsx to isolate the problem
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

jest.mock('react-bootstrap', () => {
  const React = require('react');
  const Button = (props: any) =>
    React.createElement('button', props, props.children);
  const Form = (props: any) =>
    React.createElement('form', props, props.children);
  Form.Control = (props: any) => React.createElement('input', props);
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

test('smoke: render button with icon', () => {
  const icons = require('@mui/icons-material');
  const rb = require('react-bootstrap');
  // sanity checks
   
  console.log(
    'SMOKE: icon type=',
    typeof icons.PlaylistAddCheck,
    'rb.Button type=',
    typeof rb.Button,
  );

  const Test = () => (
    <rb.Button>
      <icons.PlaylistAddCheck />
    </rb.Button>
  );

  render(<Test />);
});
