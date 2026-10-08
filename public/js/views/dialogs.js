/* ==========================================================================
   views/dialogs.js — the two modal dialogs: owner sign-in and the project
   editor. They start hidden; app.js opens and wires them.
   ========================================================================== */

(function (ns) {
  'use strict';

  ns.loginModal = function (ctx) {
    const { txt } = ns;
    return `
<div class="modal" id="login-modal" hidden>
  <div class="modal-backdrop" data-close></div>
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
    <button class="modal-x" type="button" data-close aria-label="Close">✕</button>
    <div class="modal-key" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
    <h3 class="modal-title" id="login-title" data-i18n="owner.title">${txt(ctx, 'owner.title')}</h3>
    <p class="modal-sub" data-i18n="owner.sub">${txt(ctx, 'owner.sub')}</p>

    <form id="login-form" novalidate>
      <label class="field">
        <span class="field-label" data-i18n="owner.user">${txt(ctx, 'owner.user')}</span>
        <input type="text" id="login-user" name="username" autocomplete="username" spellcheck="false" required>
      </label>
      <label class="field">
        <span class="field-label" data-i18n="owner.pass">${txt(ctx, 'owner.pass')}</span>
        <span class="field-wrap">
          <input type="password" id="login-pass" name="password" autocomplete="current-password" required>
          <button class="eye" type="button" id="toggle-pass" aria-label="Show password">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </span>
      </label>
      <p class="form-error" id="login-error" hidden></p>
      <button class="btn btn-grad modal-submit" type="submit" id="login-submit">
        <span class="spinner" id="login-spinner" hidden aria-hidden="true"></span>
        <span id="login-label" data-i18n="owner.submit">${txt(ctx, 'owner.submit')}</span>
      </button>
    </form>
    <p class="modal-foot" data-i18n="owner.foot">${txt(ctx, 'owner.foot')}</p>
  </div>
</div>`;
  };

  ns.projectModal = function (ctx) {
    const { txt } = ns;
    return `
<div class="modal" id="project-modal" hidden>
  <div class="modal-backdrop" data-project-close></div>
  <div class="modal-card project-editor" role="dialog" aria-modal="true" aria-labelledby="project-editor-title">
    <button class="modal-x" type="button" data-project-close aria-label="Close">✕</button>
    <h3 class="modal-title" id="project-editor-title" data-i18n="project.editTitle">${txt(ctx, 'project.editTitle')}</h3>
    <p class="modal-sub" data-i18n="project.editSub">${txt(ctx, 'project.editSub')}</p>
    <form id="project-edit-form">
      <input type="hidden" id="project-edit-id">
      <div class="project-fields">
        <label class="field"><span class="field-label" data-i18n="project.titleEn">${txt(ctx, 'project.titleEn')}</span><input id="project-title" required maxlength="160"></label>
        <label class="field"><span class="field-label" data-i18n="project.titleAr">${txt(ctx, 'project.titleAr')}</span><input id="project-title-ar" dir="rtl" maxlength="160"></label>
        <label class="field field-wide"><span class="field-label" data-i18n="project.url">${txt(ctx, 'project.url')}</span><input id="project-url" dir="ltr" type="url" required></label>
        <label class="field"><span class="field-label" data-i18n="project.descEn">${txt(ctx, 'project.descEn')}</span><textarea id="project-description" rows="3" maxlength="420"></textarea></label>
        <label class="field"><span class="field-label" data-i18n="project.descAr">${txt(ctx, 'project.descAr')}</span><textarea id="project-description-ar" dir="rtl" rows="3" maxlength="420"></textarea></label>
        <label class="field field-wide"><span class="field-label" data-i18n="project.image">${txt(ctx, 'project.image')}</span><input id="project-image" dir="ltr" type="text"></label>
        <label class="field"><span class="field-label" data-i18n="project.favicon">${txt(ctx, 'project.favicon')}</span><input id="project-favicon" dir="ltr" type="text"></label>
        <label class="field"><span class="field-label" data-i18n="project.tag">${txt(ctx, 'project.tag')}</span><input id="project-tag" maxlength="40"></label>
      </div>
      <p class="form-error" id="project-edit-error" hidden></p>
      <button class="btn btn-grad modal-submit" type="submit"><span data-i18n="project.save">${txt(ctx, 'project.save')}</span></button>
    </form>
  </div>
</div>`;
  };
})((window.PixelioViews = window.PixelioViews || {}));
