"use client";

import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Work } from "@/components/site/work";
import { Services } from "@/components/site/services";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export function SitePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Work />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
