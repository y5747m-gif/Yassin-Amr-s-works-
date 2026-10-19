/* “Our Work” — the section head, the owner-only composer (add a site by URL,
   inline-edit toggle, hidden-sites restore, logout, settings) and the grid of
   device cards. Ported from views/sections.js (ns.work) + app.js
   (renderGrid / analyzeAndAdd / buildOwnerSettings / setOwner). */

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Editable } from '@/components/site/editable';
import { WorkCard } from '@/components/site/work-card';
import { ChainIcon, EmptyArtIcon } from '@/lib/pixelio/icons';
import {
  settingsFields,
  settingsFieldValue,
  validateEdit,
  type ContentState,
} from '@/lib/pixelio/content';
import type { SettingsField } from '@/lib/pixelio/types';
import { useSite } from '@/site/site-context';

function SettingsRow({ field, index }: { field: SettingsField; index: number }) {
  const { content, lang, t, saveField, resetField, showToast } = useSite();
  const value = settingsFieldValue(content, field);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const revert = () => {
    if (inputRef.current) inputRef.current.value = value;
  };

  const onChange = async () => {
    const next = (inputRef.current?.value ?? '').trim();
    if (!next) {
      showToast(t('owner.emptyRevert'), 'error');
      revert();
      return;
    }
    const badReason = validateEdit(content, lang, field.path, next);
    if (badReason) {
      showToast(badReason, 'error');
      revert();
      return;
    }
    const ok = await saveField(field.scope, field.path, next);
    if (ok) showToast(t('owner.saved'), 'success');
  };

  return (
    <div className="settings-row" key={`${field.scope}:${field.path}`}>
      <label htmlFor={`setting-${index}`}>{field.label}</label>
      {field.kind === 'textarea' ? (
        <textarea
          id={`setting-${index}`}
          rows={2}
          dir={field.dir || 'auto'}
          data-scope={field.scope}
          data-path={field.path}
          ref={inputRef}
          key={value}
          defaultValue={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            /* committed on blur below — keeps typing smooth */
            void e;
          }}
          onBlur={onChange}
        />
      ) : (
        <input
          id={`setting-${index}`}
          type="text"
          dir={field.dir || 'auto'}
          data-scope={field.scope}
          data-path={field.path}
          ref={inputRef}
          key={value}
          defaultValue={value}
          onBlur={onChange}
        />
      )}
      <button
        type="button"
        className="settings-reset"
        data-scope={field.scope}
        data-path={field.path}
        title={t('owner.reset')}
        aria-label={t('owner.reset')}
        onClick={() => resetField(field.scope, field.path)}
      >
        ↺
      </button>
    </div>
  );
}

export function OwnerSettings({ content, lang }: { content: ContentState; lang: string }) {
  const fields = settingsFields(content, lang as 'en' | 'ar');
  return (
    <div className="owner-settings-body" id="owner-settings-body">
      {fields.map((field, i) => (
        <SettingsRow field={field} index={i} key={`${field.scope}:${field.path}`} />
      ))}
    </div>
  );
}

export function Work() {
  const {
    t,
    lang,
    content,
    isOwner,
    editing,
    setEditing,
    submitLogout,
    visible,
    hiddenCount,
    restoreHiddenSites,
    adding,
    addByUrl,
    shake,
  } = useSite();

  const [url, setUrl] = useState('');
  const addInputRef = useRef<HTMLLabelElement>(null);

  /* the invalid-link shake: drop the class, force a reflow, put it back */
  useEffect(() => {
    if (!shake) return;
    const wrap = addInputRef.current;
    if (!wrap) return;
    wrap.classList.remove('shake');
    void wrap.offsetWidth;
    wrap.classList.add('shake');
  }, [shake]);

  /* Escape leaves edit mode when nothing else is focused */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editing && document.activeElement === document.body) {
        setEditing(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editing, setEditing]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await addByUrl(url);
    if (ok) setUrl('');
  };

  return (
    <section className="work section" id="work">
      <div className="section-head reveal">
        <Editable k="work.kicker" as="p" className="section-kicker" />
        <Editable k="work.title" html as="h2" className="section-title" />
        <Editable k="work.sub" as="p" className="section-sub" />
      </div>

      {/* owner-only composer */}
      <div className="owner-panel" id="owner-panel" hidden={!isOwner}>
        <div className="owner-panel-head">
          <span className="owner-chip">
            <span className="owner-live" aria-hidden="true" />
            <span data-i18n="owner.signedIn">{t('owner.signedIn')}</span>
          </span>
          <div className="owner-panel-actions">
            <button
              className={editing ? 'btn-mini btn-edit-toggle active' : 'btn-mini btn-edit-toggle'}
              type="button"
              id="edit-toggle-btn"
              data-i18n="owner.editOn"
              data-no-edit=""
              onClick={() => setEditing(!editing)}
            >
              {editing ? t('owner.editOff') : t('owner.editOn')}
            </button>
            <button
              className="btn-mini btn-unhide"
              type="button"
              id="unhide-sites-btn"
              hidden={!isOwner || hiddenCount === 0}
              data-no-edit=""
              title={t('owner.unhide')}
              onClick={restoreHiddenSites}
            >
              {`${t('owner.unhide')} (${hiddenCount})`}
            </button>
            <button
              className="btn-mini"
              type="button"
              id="logout-btn"
              data-i18n="owner.logout"
              data-no-edit=""
              onClick={submitLogout}
            >
              {t('owner.logout')}
            </button>
          </div>
        </div>
        <p className="hint edit-hint" id="edit-hint" hidden={!editing} data-i18n="owner.editHint">
          {t('owner.editHint')}
        </p>

        <form className="add-bar" id="add-form" onSubmit={onSubmit}>
          <label className="add-input" ref={addInputRef}>
            <span className="add-icon" aria-hidden="true">
              <ChainIcon />
            </span>
            <input
              type="text"
              id="url-input"
              name="url"
              autoComplete="off"
              spellCheck="false"
              placeholder={t('form.placeholder')}
              data-i18n-ph="form.placeholder"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <button className="btn btn-grad add-btn" type="submit" id="add-btn" disabled={adding}>
            <span className="spinner" id="add-spinner" hidden={!adding} aria-hidden="true" />
            <span id="add-label" data-i18n="form.btn">
              {adding ? t('form.btnLoading') : t('form.btn')}
            </span>
          </button>
        </form>
        <p className="hint" data-i18n="form.hint">
          {t('form.hint')}
        </p>

        <details className="owner-settings" id="owner-settings">
          <summary data-i18n="owner.moreSettings">{t('owner.moreSettings')}</summary>
          <OwnerSettings content={content} lang={lang} />
        </details>
      </div>

      <div className="work-grid" id="grid">
        {visible.map((project, index) => (
          <WorkCard key={project.id || project.url} project={project} index={index} />
        ))}
      </div>

      <div className="empty" id="empty" hidden={visible.length > 0}>
        <div className="empty-art" aria-hidden="true">
          <EmptyArtIcon />
        </div>
        <h3 data-i18n="empty.title">{t('empty.title')}</h3>
        <p data-i18n="empty.sub">{t('empty.sub')}</p>
      </div>
    </section>
  );
}
