/* Verbatim copy of DEFAULT_CONTACTS / DEFAULT_SHOWCASE from public/js/app.js. */

export interface Contact {
  local: string;
  e164: string;
  display: string;
  labelKey: string;
}

export const DEFAULT_CONTACTS: Contact[] = [
  { local: '01141362626', e164: '201141362626', display: '0114 136 2626', labelKey: 'contact.line1' },
  { local: '01502701881', e164: '201502701881', display: '0150 270 1881', labelKey: 'contact.line2' },
];

// The hero only shows actual published projects (or images the owner explicitly
// chooses in settings). No stock/demo website screens are bundled with the site.
export const DEFAULT_SHOWCASE: string[] = [];
export const SHOWCASE_SLOTS = 4;

/** WhatsApp deep link with a prefilled message (kept in sync with the owner's numbers). */
export const waLink = (e164: string, msg?: string): string =>
  `https://wa.me/${e164}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
