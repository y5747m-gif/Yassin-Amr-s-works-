"use client";

import * as React from "react";
import { Check, Eye, LockKeyhole, Palette, Save, Settings2, SlidersHorizontal } from "lucide-react";

const STORAGE_KEY = "pixelio-owner-settings";

type Settings = {
  siteName: string;
  tagline: string;
  accent: string;
  announcement: string;
  showWork: boolean;
  showContact: boolean;
};

const defaults: Settings = {
  siteName: "pixelio",
  tagline: "Digital experiences with a point of view.",
  accent: "#171717",
  announcement: "Available for select projects in 2026.",
  showWork: true,
  showContact: true,
};

export function OwnerDashboard() {
  const [settings, setSettings] = React.useState<Settings>(defaults);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setSettings({ ...defaults, ...JSON.parse(stored) });
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
        <section className="w-full max-w-md rounded-[30px] border border-border bg-card p-7 shadow-[0_24px_80px_-32px_rgba(0,0,0,.25)] sm:p-10">
          <div className="mb-10 flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <LockKeyhole className="size-5" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Owner access</p>
          <h1 className="text-3xl font-semibold tracking-tight">Control your site.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Manage content and appearance from one focused workspace.</p>
          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); if (code.trim()) setAuthenticated(true); }}>
            <label className="block text-sm font-medium" htmlFor="owner-code">Verification code</label>
            <input id="owner-code" value={code} onChange={(event) => setCode(event.target.value)} type="password" autoComplete="current-password" className="h-12 w-full rounded-2xl border border-border bg-background px-4 outline-none transition focus:border-foreground" placeholder="Enter your code" />
            <button className="h-12 w-full rounded-2xl bg-foreground text-sm font-medium text-background transition hover:opacity-85" type="submit">Open owner workspace</button>
          </form>
          <a href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">Return to website</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Owner workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Site controls</h1></div>
          <div className="flex gap-2"><a href="/" className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium"><Eye className="size-4" /> Preview</a><button onClick={save} className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"><Save className="size-4" /> {saved ? "Saved" : "Save changes"}</button></div>
        </header>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-[28px] border border-border bg-background p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-muted"><Settings2 className="size-5" /></div><div><h2 className="font-semibold">Content</h2><p className="text-sm text-muted-foreground">Control the words visitors see first.</p></div></div>
            <div className="space-y-5">
              <Field label="Site name" value={settings.siteName} onChange={(value) => update("siteName", value)} />
              <Field label="Tagline" value={settings.tagline} onChange={(value) => update("tagline", value)} />
              <Field label="Announcement" value={settings.announcement} onChange={(value) => update("announcement", value)} />
              <div className="grid gap-3 sm:grid-cols-2"><Toggle label="Show selected work" checked={settings.showWork} onChange={(value) => update("showWork", value)} /><Toggle label="Show contact section" checked={settings.showContact} onChange={(value) => update("showContact", value)} /></div>
            </div>
          </section>
          <section className="rounded-[28px] border border-border bg-background p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-muted"><Palette className="size-5" /></div><div><h2 className="font-semibold">Appearance</h2><p className="text-sm text-muted-foreground">Keep the visual system consistent.</p></div></div>
            <label className="text-sm font-medium" htmlFor="accent">Accent color</label><div className="mt-2 flex items-center gap-3 rounded-2xl border border-border p-3"><input id="accent" type="color" value={settings.accent} onChange={(event) => update("accent", event.target.value)} className="size-10 cursor-pointer rounded-lg border-0 bg-transparent" /><span className="font-mono text-sm text-muted-foreground">{settings.accent}</span></div>
            <div className="mt-8 rounded-2xl bg-muted p-4"><div className="flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="size-4" /> Live preview behavior</div><p className="mt-2 text-sm leading-6 text-muted-foreground">Changes are kept in this browser and can be previewed immediately. Connect the database when you are ready to share settings across devices.</p></div>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-emerald-600" /> Autosave-ready workspace</div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 font-normal outline-none transition focus:border-foreground" /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border p-4 text-sm"><span>{label}</span><button type="button" aria-pressed={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-foreground" : "bg-muted"}`}><span className={`absolute top-1 size-4 rounded-full bg-background transition ${checked ? "start-6" : "start-1"}`} /></button></label>;
}
