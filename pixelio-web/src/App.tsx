import { FolderTree, Palette, Type } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { LangToggle } from '@/components/layout/lang-toggle';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

const TOKENS = [
  { name: 'background', swatch: 'bg-background border border-border' },
  { name: 'foreground', swatch: 'bg-foreground' },
  { name: 'primary', swatch: 'bg-primary' },
  { name: 'brand', swatch: 'bg-brand' },
  { name: 'muted', swatch: 'bg-muted border border-border' },
  { name: 'border', swatch: 'bg-border' },
  { name: 'card', swatch: 'bg-card border border-border' },
  { name: 'destructive', swatch: 'bg-destructive' },
];

const STRUCTURE = [
  'src/components/site/     ← sections (hero, work, services…)',
  'src/components/ui/       ← button, input, textarea, label, card',
  'src/components/layout/   ← container, section, lang + theme toggles',
  'src/lib/                 ← i18n, theme, utils, motion, messages, projects',
  'src/hooks/               ← use-local-storage, use-media-query, use-reduced-motion',
  'public/work/             ← portfolio images',
];

export default function App() {
  const { locale, dir, ui } = useLanguage();
  const { theme, resolved } = useTheme();

  return (
    <div className="grain relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />

      <Container className="relative py-10 md:py-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="pixel-dot size-2.5 rounded-[2px]" aria-hidden />
            <span className="text-lg font-semibold tracking-tightest">pixelio</span>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-14 max-w-3xl">
          <p className="eyebrow">React 19 · Vite 7 · Tailwind 4</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tightest text-balance md:text-6xl">
            {ui.foundationTitle}
          </h1>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">{ui.foundationSub}</p>
        </section>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-4 text-brand" aria-hidden />
                {ui.tokens}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              {TOKENS.map((token) => (
                <div key={token.name} className="flex flex-col gap-1.5">
                  <span className={`h-10 w-full rounded-xl ${token.swatch}`} aria-hidden />
                  <span className="text-[10px] text-muted-foreground">{token.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="size-4 text-brand" aria-hidden />
                {ui.typography}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="font-sans text-sm">{ui.sampleLatin}</p>
              <p dir="rtl" className="font-arabic text-sm">
                {ui.sampleArabic}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">{ui.locale}</dt>
                  <dd className="font-semibold">
                    {locale} · {dir.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{ui.theme}</dt>
                  <dd className="font-semibold">
                    {ui[theme]} → {ui[resolved]}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="size-4 text-brand" aria-hidden />
                {ui.structure}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1.5 font-mono text-[11px] text-muted-foreground">
                {STRUCTURE.map((line) => (
                  <li key={line} className="truncate">
                    {line}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
