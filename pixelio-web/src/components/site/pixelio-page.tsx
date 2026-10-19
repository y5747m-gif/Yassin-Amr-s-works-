/* The complete page, in the same document order as views/shell.js ns.page():
   cursor aura → intro → background → cube field → gradient defs → nav →
   main (hero, marquee, flood, work, about, contact) → WhatsApp fab →
   dialogs → toast. */

import { About } from '@/components/site/about';
import { Background, CubeField, CursorAura, PxDefs } from '@/components/site/background';
import { Contact } from '@/components/site/contact';
import { Hero } from '@/components/site/hero';
import { Intro } from '@/components/site/intro';
import { LoginModal } from '@/components/site/login-modal';
import { Marquee } from '@/components/site/marquee';
import { ProjectModal } from '@/components/site/project-modal';
import { Services } from '@/components/site/services';
import { SiteNav } from '@/components/site/site-nav';
import { Toast, WhatsAppFab } from '@/components/site/floating';
import { Work } from '@/components/site/work';
import { useSite } from '@/site/site-context';

export function PixelioPage() {
  const { perfLite } = useSite();

  return (
    <>
      <CursorAura />
      <Intro />
      <Background />
      <CubeField perfLite={perfLite} />
      <PxDefs />
      <SiteNav />
      <main id="top">
        <Hero />
        <Marquee />
        <Services />
        <Work />
        <About />
        <Contact />
      </main>
      <WhatsAppFab />
      <LoginModal />
      <ProjectModal />
      <Toast />
    </>
  );
}
