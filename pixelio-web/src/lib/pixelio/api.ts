/* Every call the page makes to the Node server at the repository root
   (server.js / api/index.js). Shapes match the vanilla site exactly, so the
   same database and the same owner session keep working.

   In dev, vite.config.ts proxies /api to http://localhost:3000 — start the
   server with `node server.js` from the repository root. */

import type { Lang } from '@/lib/pixelio/dictionary';
import type { ContentState } from '@/lib/pixelio/content';
import type { Project } from '@/lib/pixelio/types';

export class Unauthorized extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'Unauthorized';
  }
}

/* ------------------------------- content -------------------------------- */

export async function fetchContent(): Promise<ContentState | null> {
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    const data = await res.json();
    if (data && data.ok && data.content) {
      return {
        en: data.content.en || {},
        ar: data.content.ar || {},
        site: data.content.site || {},
      };
    }
  } catch {
    /* fall back to the built-in defaults */
  }
  return null;
}

export async function putContent(scope: string, path: string, value: string): Promise<void> {
  const res = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, path, value }),
  });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error('save-failed');
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error('save-failed');
}

export async function deleteContent(scope: string, path: string): Promise<void> {
  const res = await fetch(
    `/api/content?scope=${encodeURIComponent(scope)}&path=${encodeURIComponent(path)}`,
    { method: 'DELETE' },
  );
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error('reset-failed');
}

/* ------------------------------- projects -------------------------------- */

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    const data = await res.json();
    if (data && data.ok) return Array.isArray(data.projects) ? (data.projects as Project[]) : [];
  } catch {
    /* the built-in portfolio still renders */
  }
  return [];
}

export interface CreateResult {
  status: number;
  project?: Project;
}

export async function createProject(payload: {
  url: string;
  host: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
}): Promise<CreateResult> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await res.json().catch(() => ({}));
  return { status: res.status, project: out && out.ok ? (out.project as Project) : undefined };
}

export async function putProject(
  id: string,
  payload: Record<string, unknown>,
): Promise<{ status: number; project?: Project; error?: string }> {
  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await res.json().catch(() => ({}));
  return { status: res.status, project: out?.project as Project | undefined, error: out?.error };
}

export async function deleteProject(id: string): Promise<boolean> {
  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 401) throw new Unauthorized();
  return res.ok;
}

/** Non-blocking metadata enrichment: runs after the link is already saved. */
export async function enrichProjectMetadata(
  id: string,
  signal: AbortSignal,
): Promise<Project | null> {
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}/metadata`, {
      method: 'POST',
      signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const out = await res.json().catch(() => null);
    if (!out || !out.ok || !out.updated || !out.project) return null;
    return out.project as Project;
  } catch {
    return null;
  }
}

/* -------------------------------- session -------------------------------- */

export interface LoginResult {
  status: number;
  ok: boolean;
  retryAfter?: number;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: Boolean(res.ok && data.ok), retryAfter: data.retryAfter };
}

export async function logout(): Promise<boolean> {
  const res = await fetch('/api/logout', { method: 'POST' });
  return res.ok;
}

export async function checkSession(): Promise<boolean | null> {
  try {
    const res = await fetch('/api/session', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data.ok) return null;
    return Boolean(data.owner);
  } catch {
    /* a temporary network failure must not discard an active owner session */
    return null;
  }
}

export type { Lang };
