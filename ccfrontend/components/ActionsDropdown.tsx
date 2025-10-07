import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  trigger?: React.ReactNode;
  menu: React.ReactNode;
  className?: string;
};

export default function ActionsDropdown({ trigger, menu, className }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && ref.current.contains(e.target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
  }, [open]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className={className || 'btn btn-sm btn-outline-secondary'}
        onClick={() => setOpen(v => !v)}
      >
        {trigger ?? 'Acciones ▾'}
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'absolute',
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              zIndex: 9999,
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              background: '#fff',
              borderRadius: 6,
              overflow: 'hidden'
            }}
            className="actions-dropdown-portal"
            role="menu"
          >
            {menu}
          </div>,
          document.body
        )}
    </>
  );
}