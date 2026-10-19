/* One portfolio card: the site shown live inside the device, with the gradient
   “Enter site / دخول” button, the chip over the screen and (for a signed-in
   owner) the edit / hide / delete controls.
   Ported from app.js cardTemplate(). */

import type { CSSProperties } from 'react';
import { Editable } from '@/components/site/editable';
import { Device, Poster, PreviewImage, SafeImage } from '@/components/site/device';
import { projDesc, projTitle } from '@/lib/pixelio/content';
import type { Project } from '@/lib/pixelio/types';
import { useSite } from '@/site/site-context';

export function WorkCard({ project, index }: { project: Project; index: number }) {
  const { t, lang, isOwner, deviceMode, openEditor, removeProject, hideBuiltinSite } = useSite();
  const isBuiltin = Boolean(project.builtin);
  const title = projTitle(project, lang);
  const description = projDesc(project, lang);
  const enterLabel = t('card.enter');

  return (
    <article
      className={isBuiltin ? 'work-card is-builtin' : 'work-card'}
      data-id={project.id}
      data-builtin={isBuiltin ? '1' : undefined}
      style={{ '--rd': `${Math.min(index * 80, 480)}ms` } as CSSProperties}
    >
      {isOwner ? (
        <div className="project-admin-actions">
          {isBuiltin ? null : (
            <button
              className="btn-project-edit"
              type="button"
              title={t('project.edit')}
              aria-label={t('project.edit')}
              onClick={() => openEditor(project.id)}
            >
              ✎
            </button>
          )}
          <button
            className={isBuiltin ? 'btn-remove btn-hide-site' : 'btn-remove'}
            type="button"
            title={t(isBuiltin ? 'card.hide' : 'card.remove')}
            aria-label={t(isBuiltin ? 'card.hide' : 'card.remove')}
            onClick={() => (isBuiltin ? hideBuiltinSite(project.id) : removeProject(project.id))}
          >
            ✕
          </button>
        </div>
      ) : null}

      <Device
        mode={deviceMode}
        href={project.url}
        ariaLabel={title}
        overlay={
          <span className="screen-enter" aria-hidden="true">
            <Editable k="card.enter" noEdit>
              {enterLabel}
            </Editable>
            <span aria-hidden="true">↗</span>
          </span>
        }
      >
        <div className={project.cover ? 'shot cover' : 'shot'}>
          <Poster project={project} lang={lang} />
          {project.image ? (
            <PreviewImage
              className="shot-img"
              src={project.image}
              alt={title}
              capture={project.capture}
            />
          ) : null}
        </div>
      </Device>

      <div className="work-info">
        <h3 className="work-title">
          <a href={project.url} target="_blank" rel="noopener">
            {title}
          </a>
        </h3>
        {description ? <p className="work-desc">{description}</p> : null}
        <div className="work-meta">
          <span className="work-host" dir="ltr">
            {project.favicon ? <SafeImage src={project.favicon} alt="" /> : null}
            {project.host || ''}
          </span>
          <a className="btn-enter" href={project.url} target="_blank" rel="noopener" title={title}>
            <Editable k="card.enter">{enterLabel}</Editable>
            <span className="btn-enter-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
