/* The editable-content layer, ported 1:1 from public/js/app.js.

   CONTENT holds every override the owner has saved on the server, layered on
   top of the built-in I18N defaults. Nothing is hard-coded once the owner has
   touched it — every word, number and image link can be replaced. */

import { builtinSites } from '@/lib/pixelio/builtin-sites';
import {
  DEFAULT_CONTACTS,
  DEFAULT_SHOWCASE,
  SHOWCASE_SLOTS,
  type Contact,
} from '@/lib/pixelio/contacts';
import { I18N, type I18nValue, type Lang, type ServiceItem } from '@/lib/pixelio/dictionary';
import type { Project, SettingsField, ShowcaseShot } from '@/lib/pixelio/types';

export type Scope = Lang | 'site';
export type ContentMap = Record<string, string>;
export type ContentState = Record<Scope, ContentMap>;

export const emptyContent = (): ContentState => ({ en: {}, ar: {}, site: {} });

export function hasOverrides(content: ContentState): boolean {
  return (
    Object.keys(content.en).length > 0 ||
    Object.keys(content.ar).length > 0 ||
    Object.keys(content.site).length > 0
  );
}

export function ov(content: ContentState, scope: string, path: string): string | undefined {
  const bucket = content[scope as Scope];
  return bucket && Object.prototype.hasOwnProperty.call(bucket, path) ? bucket[path] : undefined;
}

export function baseText(l: string, key: string): I18nValue | undefined {
  const dict = I18N[l as Lang];
  return dict ? dict[key] : undefined;
}

/** The effective string for a key: owner override first, then the active
 *  language, then English, then the key itself. */
export function translate(content: ContentState, lang: Lang, key: string): string {
  const o = ov(content, lang, key);
  if (o !== undefined) return o;
  const base = baseText(lang, key) ?? baseText('en', key) ?? key;
  return typeof base === 'string' ? base : key;
}

export type ListItem = string | ServiceItem;

/** Effective value of an array-type i18n entry (strings or {t,d} objects) with
 *  any per-item / per-field overrides applied on top. */
export function effectiveList(content: ContentState, lang: Lang, key: string): ListItem[] {
  const raw = baseText(lang, key) ?? baseText('en', key) ?? [];
  const base = Array.isArray(raw) ? (raw as ListItem[]) : [];
  return base.map((item, i) => {
    if (item && typeof item === 'object') {
      const out: ServiceItem = { ...item };
      Object.keys(item).forEach((field) => {
        const o = ov(content, lang, `${key}.${i}.${field}`);
        if (o !== undefined) (out as unknown as Record<string, string>)[field] = o;
      });
      return out;
    }
    const o = ov(content, lang, `${key}.${i}`);
    return o !== undefined ? o : item;
  });
}

export function effectiveContacts(content: ContentState): Contact[] {
  return DEFAULT_CONTACTS.map((c, i) => {
    const raw = ov(content, 'site', `contacts.${i}.display`);
    const display = raw !== undefined ? raw : c.display;
    const digits = String(display).replace(/\D/g, '');
    let e164 = digits;
    if (digits.startsWith('0')) e164 = '20' + digits.slice(1);
    else if (!digits.startsWith('20')) e164 = '20' + digits;
    return { ...c, display, local: digits, e164 };
  });
}

/* --------------------------- built-in portfolio ----------------------------
 * The studio's own sites are part of the portfolio for every visitor — no
 * database row needed, so they survive any deploy. An owner-added project with
 * the same link replaces its built-in twin (a site can be moved into the
 * database without showing up twice), and the owner can hide a built-in card;
 * the hidden ids are stored with the rest of the editable content.
 * -------------------------------------------------------------------------- */

/** Link identity for de-duplication: ignores protocol, `www.` and a trailing slash. */
export function linkKey(url: string): string {
  return String(url || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
}

export function hiddenSiteIds(content: ContentState): string[] {
  const raw = ov(content, 'site', 'hidden.sites');
  if (raw === undefined || raw === null || raw === '') return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* not JSON — accept a plain comma-separated list too */
  }
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function hiddenSiteCount(content: ContentState): number {
  const known = new Set(builtinSites().map((s) => s.id));
  return hiddenSiteIds(content).filter((id) => known.has(id)).length;
}

/** Everything the “Our Work” grid and the hero showcase display: the owner's
 *  published projects first, then every built-in site that is neither hidden
 *  nor already published by the owner. */
export function visibleProjects(content: ContentState, projects: Project[]): Project[] {
  const published = new Set(projects.map((p) => linkKey(p.url)));
  const hidden = new Set(hiddenSiteIds(content));
  const rest = builtinSites().filter(
    (site) => !hidden.has(site.id) && !published.has(linkKey(site.url)),
  );
  return [...projects, ...rest];
}

export function projTitle(p: Project, lang: Lang): string {
  return lang === 'ar' && p.titleAr ? p.titleAr : p.title;
}

export function projDesc(p: Project, lang: Lang): string {
  return lang === 'ar' && p.descriptionAr ? p.descriptionAr : p.description || '';
}

/** The poster's big letter and brand colour (only a real hex colour is used). */
export function posterInitial(p: Project): string {
  return ((p.host || p.title || '•')[0] || '•').toUpperCase();
}

export function posterAccent(p: Project): string {
  return /^#[0-9a-f]{3,8}$/i.test(String(p.accent || '')) ? String(p.accent) : '';
}

export function effectiveShowcase(
  content: ContentState,
  lang: Lang,
  projects: Project[],
): ShowcaseShot[] {
  // An owner may pin custom images in the settings. Otherwise the showcase is
  // populated only from real portfolio entries that have a preview image.
  const custom = Array.from({ length: SHOWCASE_SLOTS }, (_, i) =>
    ov(content, 'site', `showcase.${i}`) || DEFAULT_SHOWCASE[i],
  ).filter(Boolean) as string[];
  if (custom.length) return custom.map((src) => ({ src, cover: false }));
  return visibleProjects(content, projects)
    .filter((project) => project && project.image)
    .slice(0, 4)
    .map((project) => ({
      src: project.image as string,
      cover: Boolean(project.cover),
      url: project.url,
      title: projTitle(project, lang),
      capture: project.capture,
      project,
    }));
}

/* ------------------------------ url & validation --------------------------- */

export function normalizeUrl(input: string): string | null {
  const value = String(input || '').trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const u = new URL(withProtocol);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname || !u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function basicProjectData(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, '');
  return { url: parsed.toString(), host, title: host, description: '', image: null, favicon: null };
}

export function validateEdit(
  content: ContentState,
  lang: Lang,
  path: string,
  value: string,
): string | null {
  if (path.startsWith('contacts.') && path.endsWith('.display')) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7) return translate(content, lang, 'owner.badPhone');
  }
  if (path.startsWith('showcase.')) {
    if (!/^https?:\/\//i.test(value) && !value.startsWith('/')) {
      return translate(content, lang, 'owner.badImage');
    }
  }
  return null;
}

/* ------------------------------ settings panel -----------------------------
 * Fields that aren't visible page text (tooltips, placeholders, meta tags,
 * phone numbers, showcase images) get a small labelled form so the owner can
 * still change them in one place. */

export function settingsFields(content: ContentState, lang: Lang): SettingsField[] {
  const t = (key: string) => translate(content, lang, key);
  return [
    { scope: lang, path: 'doc.title', label: t('settings.docTitle'), kind: 'text' },
    { scope: lang, path: 'meta.description', label: t('settings.metaDescription'), kind: 'textarea' },
    { scope: lang, path: 'form.placeholder', label: t('settings.placeholder'), kind: 'text' },
    { scope: lang, path: 'device.phone', label: t('settings.devicePhone'), kind: 'text' },
    { scope: lang, path: 'device.laptop', label: t('settings.deviceLaptop'), kind: 'text' },
    { scope: lang, path: 'card.remove', label: t('settings.cardRemove'), kind: 'text' },
    { scope: lang, path: 'card.enter', label: t('settings.cardEnter'), kind: 'text' },
    { scope: 'site', path: 'contacts.0.display', label: t('settings.contact1'), kind: 'text', dir: 'ltr' },
    { scope: 'site', path: 'contacts.1.display', label: t('settings.contact2'), kind: 'text', dir: 'ltr' },
    { scope: 'site', path: 'showcase.0', label: `${t('settings.showcase')} 1`, kind: 'text', dir: 'ltr' },
    { scope: 'site', path: 'showcase.1', label: `${t('settings.showcase')} 2`, kind: 'text', dir: 'ltr' },
    { scope: 'site', path: 'showcase.2', label: `${t('settings.showcase')} 3`, kind: 'text', dir: 'ltr' },
    { scope: 'site', path: 'showcase.3', label: `${t('settings.showcase')} 4`, kind: 'text', dir: 'ltr' },
  ];
}

export function settingsFieldValue(content: ContentState, field: SettingsField): string {
  const o = ov(content, field.scope, field.path);
  if (o !== undefined) return o;
  if (field.scope === 'site') {
    const cm = field.path.match(/^contacts\.(\d+)\.display$/);
    if (cm) return DEFAULT_CONTACTS[Number(cm[1])]?.display || '';
    const sm = field.path.match(/^showcase\.(\d+)$/);
    if (sm) return DEFAULT_SHOWCASE[Number(sm[1])] || '';
    return '';
  }
  const base = baseText(field.scope, field.path) ?? baseText('en', field.path) ?? '';
  return typeof base === 'string' ? base : '';
}

/** `perf-lite` is set before first paint by index.html, and at runtime by the
 *  FPS guard when a weak GPU drops frames. */
export function isLowEndDevice(): boolean {
  return document.documentElement.classList.contains('perf-lite');
}
