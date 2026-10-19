import type { Contact } from '@/lib/pixelio/contacts';
import type { Site } from '@/lib/pixelio/builtin-sites';

/** One row of the portfolio: either a site the owner published (database) or a
 *  built-in site from `builtin-sites.ts`. Built-ins carry `builtin: true`. */
export interface Project extends Omit<Site, 'id'> {
  id: string;
  tag?: string;
}

export type DeviceMode = 'phone' | 'laptop';
export type ToastKind = 'success' | 'error';

export interface ToastState {
  id: number;
  message: string;
  kind: ToastKind;
}

/** A screen inside the hero device. `project` is set when the screen belongs to
 *  a portfolio entry, which makes the screen itself a way into that site. */
export interface ShowcaseShot {
  src: string;
  cover: boolean;
  url?: string;
  title?: string;
  capture?: boolean;
  project?: Project;
}

export interface SettingsField {
  scope: string;
  path: string;
  label: string;
  kind: 'text' | 'textarea';
  dir?: string;
}

export type { Contact };
