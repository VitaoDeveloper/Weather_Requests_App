import type { ModalInput } from './ModalInput';
import type { ModalSubmit } from './ModalSubmit';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (...args: ModalSubmit[]) => Promise<void>;
  title?: string;
  inputs?: ModalInput[];
}
