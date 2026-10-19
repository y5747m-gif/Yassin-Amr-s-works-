/* Owner sign-in dialog — ported from views/dialogs.js (ns.loginModal) and
   app.js (openModal / closeModal / doLogin). */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Editable } from '@/components/site/editable';
import { EyeIcon, LockIcon } from '@/lib/pixelio/icons';
import { useSite } from '@/site/site-context';

export function LoginModal() {
  const { loginOpen, closeLogin, submitLogin, t } = useSite();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorBeat, setErrorBeat] = useState(0);
  const userRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!loginOpen) return;
    setError(null);
    const focus = window.setTimeout(() => userRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLogin();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focus);
      document.removeEventListener('keydown', onKey);
    };
  }, [loginOpen, closeLogin]);

  /* closeModal() resets the form */
  useEffect(() => {
    if (loginOpen) return;
    setUser('');
    setPass('');
    setShowPass(false);
    setBusy(false);
  }, [loginOpen]);

  /* replay the error shake */
  useEffect(() => {
    const el = errorRef.current;
    if (!errorBeat || !el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }, [errorBeat]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const outcome = await submitLogin(user.trim(), pass);
    if (outcome.ok) {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      setBusy(false);
      return;
    }

    let message: string;
    if (outcome.status === 429) {
      message = t('owner.throttled').replace('{s}', String(outcome.retryAfter || 60));
    } else if (outcome.status === 401) {
      message = t('owner.bad');
    } else {
      message = t('owner.netfail');
    }
    setError(message);
    setErrorBeat((n) => n + 1);
    setBusy(false);
  };

  const togglePass = () => {
    setShowPass((shown) => !shown);
    window.setTimeout(() => document.getElementById('login-pass')?.focus(), 0);
  };

  return (
    <div className="modal" id="login-modal" hidden={!loginOpen}>
      <div className="modal-backdrop" data-close="" onClick={closeLogin} />
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="modal-x" type="button" data-close="" aria-label="Close" onClick={closeLogin}>
          ✕
        </button>
        <div className="modal-key" aria-hidden="true">
          <LockIcon size={26} strokeWidth={1.8} />
        </div>
        <Editable k="owner.title" as="h3" className="modal-title" id="login-title" />
        <Editable k="owner.sub" as="p" className="modal-sub" />

        <form id="login-form" noValidate onSubmit={onSubmit}>
          <label className="field">
            <Editable k="owner.user" as="span" className="field-label" />
            <input
              type="text"
              id="login-user"
              name="username"
              autoComplete="username"
              spellCheck="false"
              required
              ref={userRef}
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </label>
          <label className="field">
            <Editable k="owner.pass" as="span" className="field-label" />
            <span className="field-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                id="login-pass"
                name="password"
                autoComplete="current-password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
              <button className="eye" type="button" id="toggle-pass" aria-label="Show password" onClick={togglePass}>
                <EyeIcon />
              </button>
            </span>
          </label>
          <p className="form-error" id="login-error" ref={errorRef} hidden={!error}>
            {error ?? ''}
          </p>
          <button className="btn btn-grad modal-submit" type="submit" id="login-submit" disabled={busy}>
            <span className="spinner" id="login-spinner" hidden={!busy} aria-hidden="true" />
            <span id="login-label" data-i18n="owner.submit">
              {busy ? t('owner.submitting') : t('owner.submit')}
            </span>
          </button>
        </form>
        <Editable k="owner.foot" as="p" className="modal-foot" />
      </div>
    </div>
  );
}
