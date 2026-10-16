'use client'

import { useEffect, useId, useRef, useState } from 'react';
import { X, MoreHorizontal } from 'lucide-react';

export {
  inputClass,
  selectClass,
  buttonClass,
  Button,
  Badge,
  PageHeader,
  Panel,
  Field,
  FocalNumber,
  StateMessage
} from './kit-static';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md'
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('input, select, textarea') || panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // Keep Tab inside the dialog.
      if (e.key === 'Tab' && panel) {
        const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.offsetParent !== null);
        if (items.length === 0) return;
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#140b20]/55 sm:p-4"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${widths[size]} max-h-[92dvh] overflow-y-auto overscroll-contain bg-surface text-ink border border-line rounded-t-2xl sm:rounded-2xl shadow-raised pb-[env(safe-area-inset-bottom)]`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-surface border-b border-line pl-5 pr-2 py-1.5">
          <h2 id={titleId} className="text-xl font-semibold text-ink py-2">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="px-5 pt-5 pb-5">{children}</div>
      </div>
    </div>
  );
}

// Footer row for forms inside a Modal. Sticks to the bottom of the sheet so Save stays
// within thumb reach on long forms; on phones the buttons share the row equally.
export function ModalActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 mt-5 px-5 py-3 bg-surface border-t border-line flex gap-2 justify-end [&>*]:flex-1 sm:[&>*]:flex-none">
      {children}
    </div>
  );
}

// Square 44px icon button; the label is read by screen readers and shown as a tooltip.
export function IconButton({
  label,
  tone = 'neutral',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'neutral' | 'danger' }) {
  const toneClass = tone === 'danger' ? 'text-ink-3 hover:text-danger hover:bg-danger-soft' : 'text-ink-2 hover:text-ink hover:bg-surface-2';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`w-11 h-11 md:w-9 md:h-9 shrink-0 inline-flex items-center justify-center rounded-lg cursor-pointer ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export type SheetAction = {
  label: string;
  onSelect: () => void;
  tone?: 'neutral' | 'danger';
  icon?: React.ReactNode;
  hidden?: boolean;
};

// A "more" button that opens a bottom sheet of actions: keeps rarely used or destructive
// actions one tap away without crowding each row.
export function RowActions({ title, actions, label }: { title: string; actions: SheetAction[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter(a => !a.hidden);
  if (visible.length === 0) return null;
  return (
    <>
      <IconButton label={label || `Aksi lain untuk ${title}`} onClick={e => { e.stopPropagation(); setOpen(true); }}>
        <MoreHorizontal size={18} aria-hidden />
      </IconButton>
      <Modal open={open} onClose={() => setOpen(false)} title={title} size="sm">
        <ul className="-mx-2 -my-2">
          {visible.map(action => (
            <li key={action.label}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onSelect();
                }}
                className={`w-full flex items-center gap-3 px-3 min-h-[52px] rounded-lg text-left text-[15px] font-medium cursor-pointer ${
                  action.tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-surface-2'
                }`}
              >
                {action.icon && <span className="shrink-0 opacity-80" aria-hidden>{action.icon}</span>}
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

// Primary action floating above the phone bottom bar; hidden from md up where the page header shows it.
// Shrinks to a round icon once the user scrolls, so it covers less of the cards underneath.
export function Fab({ label, icon, onClick }: { label: string; icon?: React.ReactNode; onClick: () => void }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 160);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`md:hidden fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 inline-flex items-center justify-center gap-2 h-14 rounded-full bg-brand text-on-brand font-semibold text-sm shadow-raised cursor-pointer ${
        compact ? 'w-14 px-0' : 'pl-4 pr-5'
      }`}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {!compact && <span aria-hidden>{label}</span>}
    </button>
  );
}
