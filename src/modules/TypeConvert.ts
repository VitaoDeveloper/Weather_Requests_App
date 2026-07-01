import type { HTMLInputTypes } from '../types/HTMLInputTypes';
import type { ModalSubmit } from '../types/ModalSubmit';

export const TypeConvert: Record<HTMLInputTypes, (v: string) => ModalSubmit> = {
  text: (v) => String(v),
  number: (v) => Number(v),
  date: (v) => new Date(v),
};
