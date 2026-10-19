/* The project editor — ported from views/dialogs.js (ns.projectModal) and
   app.js (openProjectEditor / closeProjectEditor / saveProjectDetails). */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Editable } from '@/components/site/editable';
import { normalizeUrl } from '@/lib/pixelio/content';
import { useSite } from '@/site/site-context';

interface EditorForm {
  title: string;
  titleAr: string;
  url: string;
  description: string;
  descriptionAr: string;
  image: string;
  favicon: string;
  tag: string;
}

const EMPTY: EditorForm = {
  title: '',
  titleAr: '',
  url: '',
  description: '',
  descriptionAr: '',
  image: '',
  favicon: '',
  tag: '',
};

export function ProjectModal() {
  const { editorProject, closeEditor, saveEditor, lang } = useSite();
  const [form, setForm] = useState<EditorForm>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editorProject) return;
    setForm({
      title: editorProject.title || '',
      titleAr: editorProject.titleAr || '',
      url: editorProject.url || '',
      description: editorProject.description || '',
      descriptionAr: editorProject.descriptionAr || '',
      image: editorProject.image || '',
      favicon: editorProject.favicon || '',
      tag: editorProject.tag || '',
    });
    setError(null);
    const focus = window.setTimeout(() => titleRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditor();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focus);
      document.removeEventListener('keydown', onKey);
    };
  }, [editorProject, closeEditor]);

  const set = (key: keyof EditorForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editorProject || busy) return;

    const payload = {
      title: form.title.trim(),
      titleAr: form.titleAr.trim(),
      url: normalizeUrl(form.url),
      description: form.description.trim(),
      descriptionAr: form.descriptionAr.trim(),
      image: form.image.trim() || null,
      favicon: form.favicon.trim() || null,
      tag: form.tag.trim(),
    };

    if (!payload.title || !payload.url) {
      setError(lang === 'ar' ? 'العنوان والرابط الصحيح مطلوبان.' : 'A title and valid URL are required.');
      return;
    }

    setBusy(true);
    const result = await saveEditor(editorProject.id, payload);
    setBusy(false);
    if (!result.ok && result.error) setError(result.error);
  };

  return (
    <div className="modal" id="project-modal" hidden={!editorProject}>
      <div className="modal-backdrop" data-project-close="" onClick={closeEditor} />
      <div
        className="modal-card project-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-editor-title"
      >
        <button
          className="modal-x"
          type="button"
          data-project-close=""
          aria-label="Close"
          onClick={closeEditor}
        >
          ✕
        </button>
        <Editable k="project.editTitle" as="h3" className="modal-title" id="project-editor-title" />
        <Editable k="project.editSub" as="p" className="modal-sub" />

        <form id="project-edit-form" onSubmit={onSubmit}>
          <input type="hidden" id="project-edit-id" value={editorProject?.id ?? ''} readOnly />
          <div className="project-fields">
            <label className="field">
              <Editable k="project.titleEn" as="span" className="field-label" />
              <input
                id="project-title"
                required
                maxLength={160}
                ref={titleRef}
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
              />
            </label>
            <label className="field">
              <Editable k="project.titleAr" as="span" className="field-label" />
              <input
                id="project-title-ar"
                dir="rtl"
                maxLength={160}
                value={form.titleAr}
                onChange={(e) => set('titleAr')(e.target.value)}
              />
            </label>
            <label className="field field-wide">
              <Editable k="project.url" as="span" className="field-label" />
              <input
                id="project-url"
                dir="ltr"
                type="url"
                required
                value={form.url}
                onChange={(e) => set('url')(e.target.value)}
              />
            </label>
            <label className="field">
              <Editable k="project.descEn" as="span" className="field-label" />
              <textarea
                id="project-description"
                rows={3}
                maxLength={420}
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
              />
            </label>
            <label className="field">
              <Editable k="project.descAr" as="span" className="field-label" />
              <textarea
                id="project-description-ar"
                dir="rtl"
                rows={3}
                maxLength={420}
                value={form.descriptionAr}
                onChange={(e) => set('descriptionAr')(e.target.value)}
              />
            </label>
            <label className="field field-wide">
              <Editable k="project.image" as="span" className="field-label" />
              <input
                id="project-image"
                dir="ltr"
                type="text"
                value={form.image}
                onChange={(e) => set('image')(e.target.value)}
              />
            </label>
            <label className="field">
              <Editable k="project.favicon" as="span" className="field-label" />
              <input
                id="project-favicon"
                dir="ltr"
                type="text"
                value={form.favicon}
                onChange={(e) => set('favicon')(e.target.value)}
              />
            </label>
            <label className="field">
              <Editable k="project.tag" as="span" className="field-label" />
              <input
                id="project-tag"
                maxLength={40}
                value={form.tag}
                onChange={(e) => set('tag')(e.target.value)}
              />
            </label>
          </div>
          <p className="form-error" id="project-edit-error" hidden={!error}>
            {error ?? ''}
          </p>
          <button className="btn btn-grad modal-submit" type="submit" disabled={busy}>
            <Editable k="project.save" />
          </button>
        </form>
      </div>
    </div>
  );
}
