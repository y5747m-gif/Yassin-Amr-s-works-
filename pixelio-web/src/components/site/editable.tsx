/* Owner inline editing — the React version of app.js's contenteditable layer.
 *
 * The stylesheet drives this feature through attributes, so they are emitted
 * exactly as before:
 *
 *   body.owner-editing [data-i18n]:not([data-no-edit])
 *   body.owner-editing [data-i18n-html]:not([data-no-edit])
 *   body.owner-editing [data-edit-path]:not([data-no-edit])
 *   body.owner-editing [contenteditable="true"]:focus
 *   .owner-editable.saving / .saved-flash
 *
 * Escape reverts, Enter commits, a double-click resets the field to its
 * built-in default (DELETE /api/content), and a blur saves (PUT /api/content).
 */

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { baseText, validateEdit } from '@/lib/pixelio/content';
import { useSite } from '@/site/site-context';
import { cn } from '@/lib/utils';

export interface EditableProps {
  as?: ElementType;
  /** Built-in i18n key (rendered as text). */
  k?: string;
  /** The key holds trusted inline markup, e.g. `<span class="grad">`. */
  html?: boolean;
  /** List/site scoped override: `marquee.3`, `services.items.0.t`, `contacts.0.display`. */
  path?: string;
  scope?: string;
  defaultValue?: string;
  /** Renders the text but keeps it out of edit mode (data-no-edit). */
  noEdit?: boolean;
  className?: string;
  dir?: string;
  style?: CSSProperties;
  /** Effective value when it comes from a list (effectiveList) rather than t(). */
  children?: ReactNode;
  title?: string;
  /** Stagger delay for the reveal observer (`--rd`). */
  delay?: number | string;
  /** Pass-through for the few editable nodes that are links or need an id. */
  href?: string;
  target?: string;
  rel?: string;
  id?: string;
}

export function Editable({
  as,
  k,
  html = false,
  path,
  scope,
  defaultValue,
  noEdit = false,
  className,
  dir,
  style,
  children,
  title,
  delay,
  href,
  target,
  rel,
  id,
}: EditableProps) {
  const Tag = (as ?? 'span') as ElementType;
  const { lang, content, editing, isOwner, t, showToast, saveField, resetField } = useSite();
  const ref = useRef<HTMLElement | null>(null);
  const before = useRef('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const live = editing && isOwner && !noEdit;
  const info = path
    ? { scope: scope || 'site', path, html: false }
    : k
      ? { scope: lang, path: k, html }
      : null;

  const value = children ?? (k ? t(k) : '');

  const fallback = useCallback(() => {
    if (defaultValue !== undefined) return defaultValue;
    if (!info) return '';
    const base = baseText(info.scope, info.path) ?? baseText('en', info.path) ?? '';
    return typeof base === 'string' ? base : '';
  }, [defaultValue, info?.scope, info?.path]);

  const restore = (snapshot: string) => {
    const el = ref.current;
    if (!el) return;
    if (info?.html) el.innerHTML = snapshot;
    else el.textContent = snapshot;
  };

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (!live) return;
    const el = e.currentTarget;
    before.current = info?.html ? el.innerHTML : el.textContent ?? '';
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!live) return;
    if (e.key === 'Escape') {
      restore(before.current);
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const onBlur = async (e: FocusEvent<HTMLElement>) => {
    if (!live || !info) return;
    const el = e.currentTarget;
    const now = (info.html ? el.innerHTML : el.textContent ?? '').trim();
    const prev = before.current.trim();
    if (now === prev) return;

    if (!now) {
      restore(before.current);
      showToast(t('owner.emptyRevert'), 'error');
      return;
    }

    const badReason = validateEdit(content, lang, info.path, now);
    if (badReason) {
      restore(before.current);
      showToast(badReason, 'error');
      return;
    }

    setState('saving');
    const ok = await saveField(info.scope, info.path, now);
    if (!ok) {
      setState('idle');
      restore(before.current);
      return;
    }
    setState('saved');
    window.setTimeout(() => setState('idle'), 900);
  };

  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (live) e.preventDefault();
  };

  const onDoubleClick = async (e: MouseEvent<HTMLElement>) => {
    if (!live || !info) return;
    e.preventDefault();
    const ok = await resetField(info.scope, info.path);
    if (ok) {
      const el = ref.current;
      if (el) {
        const def = fallback();
        if (info.html) el.innerHTML = def;
        else el.textContent = def;
      }
    }
  };

  const dataAttrs: Record<string, string | undefined> = path
    ? {
        'data-edit-scope': scope || 'site',
        'data-edit-path': path,
        'data-edit-default': defaultValue ?? fallback(),
      }
    : html && k
      ? { 'data-i18n-html': k }
      : k
        ? { 'data-i18n': k }
        : {};

  return (
    <Tag
      ref={ref}
      id={id}
      data-delay={delay === undefined ? undefined : String(delay)}
      href={href}
      target={target}
      rel={rel}
      className={cn(info && !noEdit && 'owner-editable', state === 'saving' && 'saving', state === 'saved' && 'saved-flash', className)}
      dir={dir}
      style={style}
      title={title}
      {...dataAttrs}
      {...(noEdit ? { 'data-no-edit': '' } : {})}
      {...(live
        ? {
            contentEditable: 'true',
            suppressContentEditableWarning: true,
            onFocus,
            onKeyDown,
            onBlur,
            onClick,
            onDoubleClick,
          }
        : info && !noEdit
          ? { contentEditable: 'false', suppressContentEditableWarning: true }
          : {})}
      {...(info?.html && children === undefined
        ? { dangerouslySetInnerHTML: { __html: typeof value === 'string' ? value : '' } }
        : {})}
    >
      {info?.html && children === undefined ? undefined : value}
    </Tag>
  );
}

/** Trusted markup from the dictionary (`<span class="grad">…`). */
export function RichText({ k, as, className }: { k: string; as?: ElementType; className?: string }) {
  return <Editable k={k} html as={as} className={className} />;
}
