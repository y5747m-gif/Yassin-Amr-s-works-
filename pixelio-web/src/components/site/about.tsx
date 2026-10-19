/* About — the studio card with its glow, wordmark and skill tags.
   Ported from views/sections.js (ns.about) + app.js (buildTags). */

import { Editable } from '@/components/site/editable';
import { baseText, type ListItem } from '@/lib/pixelio/content';
import { useSite } from '@/site/site-context';

export function About() {
  const { lang, list } = useSite();
  const items = list('about.tags').map((item: ListItem) => (typeof item === 'string' ? item : item.t));
  const defaults = (baseText(lang, 'about.tags') as string[] | undefined) ?? [];

  return (
    <section className="about section" id="about">
      <div className="about-card reveal">
        <div className="about-glow" aria-hidden="true" />
        <div className="about-logo" aria-hidden="true">
          Pixelio
        </div>
        <Editable k="about.kicker" as="p" className="section-kicker" />
        <Editable k="about.title" as="h2" className="section-title" />
        <Editable k="about.text" as="p" className="about-text" />
        <ul className="tags" id="tags">
          {items.map((tag, i) => (
            <Editable
              as="li"
              key={`${i}-${tag}`}
              path={`about.tags.${i}`}
              scope={lang}
              defaultValue={defaults[i] ?? ''}
            >
              {tag}
            </Editable>
          ))}
        </ul>
      </div>
    </section>
  );
}
