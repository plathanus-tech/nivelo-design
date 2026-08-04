import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import styles from './FilterPopover.module.css';

export interface FilterPopoverProps {
  label?: string;
  fields: ReactNode;
  onApply: () => void;
  onClear: () => void;
}

export function FilterPopover({ label = 'Filtros', fields, onApply, onClear }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 320 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function toggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const margin = 16;
      const width = Math.min(320, window.innerWidth - margin * 2);
      let left = rect.left;
      if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
      if (left < margin) left = margin;
      setPosition({ left, top: rect.bottom + 8, width });
    }
    setOpen((value) => !value);
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={`${styles.trigger} text-body-s`} ref={triggerRef} onClick={toggle} aria-expanded={open}>
        <span className={styles.triggerIcon}><SlidersHorizontal size={16} /></span>
        <span>{label}</span>
      </button>
      {open && (
        <div
          className={styles.popover}
          ref={popoverRef}
          style={{ left: position.left, top: position.top, width: position.width }}
        >
          {fields}
          <div className={styles.actions}>
            <button type="button" className="btn secondary sm" onClick={onClear}>Limpar</button>
            <button type="button" className="btn primary sm" onClick={onApply}>Aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}
