/* The counter-scrolling keyword strip and the three streams in the flood —
   ported from views/sections.js (ns.marquee) + app.js (buildMarquee /
   buildStream). Both tracks are duplicated so the loop is seamless. */

import { Editable } from '@/components/site/editable';
import { baseText, type ListItem } from '@/lib/pixelio/content';
import { useSite } from '@/site/site-context';

const words = (items: ListItem[]) => items.map((item) => (typeof item === 'string' ? item : item.t));

export function Marquee() {
  const { lang, list } = useSite();
  const items = words(list('marquee'));
  const defaults = (baseText(lang, 'marquee') as string[] | undefined) ?? [];

  const track = items.map((word, i) => (
    <span className="marquee-item" key={`${i}-${word}`}>
      <i>✦</i>
      <Editable path={`marquee.${i}`} scope={lang} defaultValue={defaults[i] ?? ''}>
        {word}
      </Editable>
    </span>
  ));

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" id="marquee-track">
        {track}
        {track}
      </div>
    </div>
  );
}

export function Streams() {
  const { lang, list } = useSite();
  const items = words(list('services.stream'));
  const defaults = (baseText(lang, 'services.stream') as string[] | undefined) ?? [];
  if (!items.length) return null;

  return (
    <div className="flood-stream" aria-hidden="true">
      {[0, 1, 2].map((row) => {
        const order = items.map((_, i) => (i + row * 6) % items.length);
        const chips = order.map((realIdx, j) => (
          <Editable
            as="span"
            key={`${row}-${j}-${realIdx}`}
            className={(j + row) % 5 === 0 ? 'stream-chip hot' : 'stream-chip'}
            path={`services.stream.${realIdx}`}
            scope={lang}
            defaultValue={defaults[realIdx] ?? ''}
          >
            {items[realIdx]}
          </Editable>
        ));
        return (
          <div className="stream-row" key={row}>
            <div className="stream-track" data-dir={row === 1 ? 'rtl' : 'ltr'}>
              {chips}
              {chips}
            </div>
          </div>
        );
      })}
    </div>
  );
}
