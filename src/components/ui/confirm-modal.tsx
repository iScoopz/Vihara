'use client'

import { Button, Modal, ModalActions } from '@/components/ui/kit';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Ya, hapus',
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-ink-2">{message}</p>
      <ModalActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </ModalActions>
    </Modal>
  );
}
