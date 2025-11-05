import { render, screen } from '@testing-library/react';
import React from 'react';

import CategoryBadge from '../components/documentos/CategoryBadge';
import FileIcon from '../components/documentos/FileIcon';
import PersonaCard from '../components/personas/PersonaCard';

describe('CategoryBadge', () => {
  it('renders category text and icon for legal', () => {
    render(<CategoryBadge category='legal' />);
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('gavel')).toBeInTheDocument();
  });
});

describe('FileIcon', () => {
  it('shows pdf icon for .pdf files', () => {
    render(<FileIcon fileName='document.pdf' />);
    expect(document.querySelector('.file-icon-pdf')).toBeTruthy();
    expect(screen.getByText('picture_as_pdf')).toBeInTheDocument();
  });

  it('shows image icon for jpg files', () => {
    render(<FileIcon fileName='photo.jpg' size='sm' />);
    expect(document.querySelector('.file-icon-image')).toBeTruthy();
    expect(screen.getByText('image')).toBeInTheDocument();
  });
});

describe('PersonaCard', () => {
  const persona = {
    id: 'p1',
    nombre: 'Juan Perez',
    dni: '12345678',
    email: 'juan@example.com',
    telefono: '+56912345678',
    tipo: 'Propietario',
    estado: 'Activo',
    unidades: 2,
  };

  it('renders persona details and badge', () => {
    render(<PersonaCard persona={persona as any} />);
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('DNI: 12345678')).toBeInTheDocument();
    expect(screen.getByText('Propietario')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('+56912345678')).toBeInTheDocument();
    expect(screen.getByText('2 unidades')).toBeInTheDocument();
  });
});
