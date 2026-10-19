/* Pixelio — official site, rebuilt in React on the same markup, the same
   stylesheet (src/styles/pixelio.css is a verbatim copy of the original
   public/css/style.css) and the same behaviour as the vanilla page. */

import { useCallback } from 'react';
import { PixelioPage } from '@/components/site/pixelio-page';
import { useMotion3D } from '@/hooks/use-motion';
import { useRevealObserver } from '@/hooks/use-reveal';
import { useViewportPerformance } from '@/hooks/use-viewport-perf';
import { SiteProvider, useSite } from '@/site/site-context';

function Site() {
  const { perfLite, setPerfLite } = useSite();

  useRevealObserver();
  useMotion3D(!perfLite);
  const onPerfLite = useCallback(() => setPerfLite(true), [setPerfLite]);
  useViewportPerformance(onPerfLite);

  return <PixelioPage />;
}

export default function App() {
  return (
    <SiteProvider>
      <Site />
    </SiteProvider>
  );
}
