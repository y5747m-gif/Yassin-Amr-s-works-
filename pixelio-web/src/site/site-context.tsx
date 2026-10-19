/* The page state, ported from public/js/app.js.
 *
 * The vanilla app kept module-level variables (lang, CONTENT, projects,
 * isOwner, editingOn, deviceMode) and rebuilt innerHTML by hand. Here the same
 * values live in one context; components read them and React does the rebuild.
 * Storage keys, API calls, toast timings and side effects are unchanged. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  basicProjectData,
  effectiveContacts,
  effectiveList,
  emptyContent,
  hasOverrides,
  hiddenSiteCount,
  isLowEndDevice,
  normalizeUrl,
  translate,
  visibleProjects,
  effectiveShowcase,
  hiddenSiteIds,
  baseText as baseTextRef,
  type ContentState,
  type ListItem,
} from '@/lib/pixelio/content';
import {
  checkSession as apiCheckSession,
  createProject,
  deleteContent,
  deleteProject,
  enrichProjectMetadata,
  fetchContent,
  fetchProjects,
  login as apiLogin,
  logout as apiLogout,
  putContent,
  putProject,
  Unauthorized,
} from '@/lib/pixelio/api';
import type { Lang } from '@/lib/pixelio/dictionary';
import type { DeviceMode, Project, ShowcaseShot, ToastKind, ToastState } from '@/lib/pixelio/types';
import type { Contact } from '@/lib/pixelio/contacts';

const LANG_KEY = 'twe-lang';
const DEVICE_KEY = 'twe-device';
const METADATA_TIMEOUT_MS = 5000;
const TOAST_MS = 3400;

function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function detectDevice(): DeviceMode {
  const wide = window.matchMedia('(min-width: 900px)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const touch = navigator.maxTouchPoints > 1;
  return wide && (fine || !touch) ? 'laptop' : 'phone';
}

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export interface LoginOutcome {
  ok: boolean;
  status: number;
  retryAfter?: number;
}

export interface SiteContextValue {
  /* state */
  lang: Lang;
  dir: 'ltr' | 'rtl';
  content: ContentState;
  projects: Project[];
  visible: Project[];
  contacts: Contact[];
  showcase: ShowcaseShot[];
  hiddenCount: number;
  isOwner: boolean;
  editing: boolean;
  deviceMode: DeviceMode;
  toast: ToastState | null;
  loginOpen: boolean;
  editorProject: Project | null;
  introOpen: boolean;
  adding: boolean;
  perfLite: boolean;
  /** Bumped whenever the “add site” input should shake. */
  shake: number;

  /* lookups */
  t: (key: string) => string;
  list: (key: string) => ListItem[];
  base: (l: string, key: string) => unknown;

  /* actions */
  setLang: (next: Lang, opts?: { animate?: boolean }) => void;
  setDeviceMode: (mode: DeviceMode, opts?: { remember?: boolean }) => void;
  showToast: (message: string, kind?: ToastKind) => void;
  saveField: (scope: string, path: string, value: string) => Promise<boolean>;
  resetField: (scope: string, path: string) => Promise<boolean>;
  setEditing: (on: boolean) => void;
  openLogin: () => void;
  closeLogin: () => void;
  submitLogin: (username: string, password: string) => Promise<LoginOutcome>;
  submitLogout: () => Promise<void>;
  openEditor: (id: string) => void;
  closeEditor: () => void;
  saveEditor: (id: string, payload: Record<string, unknown>) => Promise<SaveResult>;
  addByUrl: (rawUrl: string) => Promise<boolean>;
  removeProject: (id: string) => Promise<void>;
  hideBuiltinSite: (id: string) => Promise<void>;
  restoreHiddenSites: () => Promise<void>;
  setIntroOpen: (open: boolean) => void;
  setPerfLite: (lite: boolean) => void;
}

export const SiteContext = createContext<SiteContextValue | null>(null);

function withOverride(prev: ContentState, scope: string, path: string, value: string): ContentState {
  const key = scope as keyof ContentState;
  return { ...prev, [key]: { ...prev[key], [path]: value } };
}

function withoutOverride(prev: ContentState, scope: string, path: string): ContentState {
  const key = scope as keyof ContentState;
  const bucket = { ...prev[key] };
  delete bucket[path];
  return { ...prev, [key]: bucket };
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = readPreference(LANG_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
    return (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  });
  const [content, setContent] = useState<ContentState>(emptyContent);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditingState] = useState(false);
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(
    () => (readPreference(DEVICE_KEY) as DeviceMode | null) || detectDevice(),
  );
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorProject, setEditorProject] = useState<Project | null>(null);
  const [introOpen, setIntroOpen] = useState(
    () => !document.documentElement.classList.contains('intro-skip'),
  );
  const [adding, setAdding] = useState(false);
  const [perfLite, setPerfLiteState] = useState(() => isLowEndDevice());
  const [shake, setShake] = useState(0);

  const sessionRevision = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const editorRef = useRef<Project | null>(null);
  editorRef.current = editorProject;

  /* ------------------------------- lookups ------------------------------- */

  const t = useCallback((key: string) => translate(content, lang, key), [content, lang]);
  const list = useCallback((key: string) => effectiveList(content, lang, key), [content, lang]);
  const base = useCallback((l: string, key: string) => {
    // Imported lazily to keep this file focused on state.
    return baseTextRef(l, key);
  }, []);

  const contacts = useMemo(() => effectiveContacts(content), [content]);
  const visible = useMemo(() => visibleProjects(content, projects), [content, projects]);
  const showcase = useMemo(
    () => effectiveShowcase(content, lang, projects),
    [content, lang, projects],
  );
  const hiddenCountValue = useMemo(() => hiddenSiteCount(content), [content]);

  /* -------------------------------- toast -------------------------------- */

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ id: Date.now(), message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [toast]);

  /* ------------------------- document side effects ------------------------ */

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* private mode */
    }
    document.title = translate(content, lang, 'doc.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', translate(content, lang, 'meta.description'));
  }, [lang, content]);

  useEffect(() => {
    document.documentElement.dataset.deviceMode = deviceMode;
  }, [deviceMode]);

  useEffect(() => {
    document.body.classList.toggle('owner-editing', editing && isOwner);
  }, [editing, isOwner]);

  useEffect(() => {
    document.body.classList.toggle('locked', introOpen || loginOpen || editorProject !== null);
  }, [introOpen, loginOpen, editorProject]);

  useEffect(() => {
    document.documentElement.classList.toggle('perf-lite', perfLite);
    if (perfLite) document.body.classList.remove('has-pointer');
  }, [perfLite]);

  /* --------------------------- first-load fetches -------------------------- */

  useEffect(() => {
    let alive = true;
    fetchContent().then((next) => {
      if (alive && next && hasOverrides(next)) setContent(next);
    });
    const revision = sessionRevision.current;
    apiCheckSession().then((owner) => {
      if (alive && owner !== null && revision === sessionRevision.current) setIsOwner(owner);
    });
    fetchProjects().then((rows) => {
      if (alive) setProjects(rows);
    });
    return () => {
      alive = false;
    };
  }, []);

  /* ------------------------- device mode on resize ------------------------- */

  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (readPreference(DEVICE_KEY)) return; // the visitor chose explicitly
        setDeviceModeState(detectDevice());
      }, 220);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* -------------------------------- actions -------------------------------- */

  const setLang = useCallback((next: Lang, opts: { animate?: boolean } = {}) => {
    const value: Lang = next === 'ar' ? 'ar' : 'en';
    if (opts.animate) {
      document.body.classList.add('lang-fade');
      window.setTimeout(() => document.body.classList.remove('lang-fade'), 240);
    }
    setLangState(value);
  }, []);

  const setDeviceMode = useCallback((mode: DeviceMode, opts: { remember?: boolean } = {}) => {
    const value: DeviceMode = mode === 'laptop' ? 'laptop' : 'phone';
    if (opts.remember !== false) {
      try {
        localStorage.setItem(DEVICE_KEY, value);
      } catch {
        /* private mode */
      }
    }
    setDeviceModeState(value);
  }, []);

  const syncAfterContentChange = useCallback((path: string) => {
    /* React re-renders every consumer, so the ripple the vanilla app did by
       hand (links, meta tags, card tooltips) happens on its own. Paths that
       used to force a full grid rebuild need nothing extra here. */
    void path;
  }, []);

  const saveField = useCallback(
    async (scope: string, path: string, value: string) => {
      try {
        await putContent(scope, path, value);
        setContent((prev) => withOverride(prev, scope, path, value));
        syncAfterContentChange(path);
        return true;
      } catch (error) {
        if (error instanceof Unauthorized) {
          setIsOwner(false);
          setEditingState(false);
          showToast(translate(content, lang, 'toast.needOwner'), 'error');
        } else {
          showToast(translate(content, lang, 'owner.savefail'), 'error');
        }
        return false;
      }
    },
    [content, lang, showToast, syncAfterContentChange],
  );

  const resetField = useCallback(
    async (scope: string, path: string) => {
      try {
        await deleteContent(scope, path);
        setContent((prev) => withoutOverride(prev, scope, path));
        syncAfterContentChange(path);
        showToast(translate(content, lang, 'owner.reset'), 'success');
        return true;
      } catch (error) {
        if (error instanceof Unauthorized) {
          setIsOwner(false);
          setEditingState(false);
          showToast(translate(content, lang, 'toast.needOwner'), 'error');
        } else {
          showToast(translate(content, lang, 'owner.resetfail'), 'error');
        }
        return false;
      }
    },
    [content, lang, showToast, syncAfterContentChange],
  );

  const setEditing = useCallback(
    (on: boolean) => {
      setEditingState(Boolean(on) && isOwner);
    },
    [isOwner],
  );

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const submitLogin = useCallback(
    async (username: string, password: string): Promise<LoginOutcome> => {
      sessionRevision.current += 1;
      try {
        const outcome = await apiLogin(username, password);
        if (outcome.ok) {
          setLoginOpen(false);
          setIsOwner(true);
          showToast(translate(content, lang, 'owner.welcome'), 'success');
        }
        return outcome;
      } catch {
        return { ok: false, status: 0 };
      }
    },
    [content, lang, showToast],
  );

  const submitLogout = useCallback(async () => {
    sessionRevision.current += 1;
    const ok = await apiLogout();
    if (!ok) {
      showToast(translate(content, lang, 'owner.netfail'), 'error');
      return;
    }
    setIsOwner(false);
    setEditingState(false);
    showToast(translate(content, lang, 'owner.bye'), 'success');
  }, [content, lang, showToast]);

  const openEditor = useCallback(
    (id: string) => {
      const found = projects.find((item) => item.id === id);
      if (!found || !isOwner) return;
      setEditorProject(found);
    },
    [projects, isOwner],
  );

  const closeEditor = useCallback(() => setEditorProject(null), []);

  const saveEditor = useCallback(
    async (id: string, payload: Record<string, unknown>): Promise<SaveResult> => {
      try {
        const out = await putProject(id, payload);
        if (out.status === 401) {
          setEditorProject(null);
          setIsOwner(false);
          showToast(translate(content, lang, 'toast.needOwner'), 'error');
          setLoginOpen(true);
          return { ok: false };
        }
        if (out.status >= 400 || !out.project) {
          return { ok: false, error: translate(content, lang, 'owner.savefail') };
        }
        const saved = out.project;
        setProjects((prev) => prev.map((p) => (p.id === id ? saved : p)));
        setEditorProject(null);
        showToast(translate(content, lang, 'project.saved'), 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: translate(content, lang, 'owner.savefail') };
      }
    },
    [content, lang, showToast],
  );

  /** Background metadata enrichment — never blocks the UI, strict timeout. */
  const enrichInBackground = useCallback((id: string) => {
    if (!id) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), METADATA_TIMEOUT_MS + 500);
    void enrichProjectMetadata(id, ctrl.signal).then((updated) => {
      window.clearTimeout(timer);
      if (!updated) return;
      setProjects((prev) => {
        if (editorRef.current?.id === id) return prev; // open in the editor
        const index = prev.findIndex((p) => p.id === id);
        if (index < 0) return prev;
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    });
  }, []);

  const addByUrl = useCallback(
    async (rawUrl: string): Promise<boolean> => {
      const url = normalizeUrl(rawUrl);
      if (!url) {
        showToast(translate(content, lang, 'toast.invalid'), 'error');
        setShake((n) => n + 1);
        return false;
      }
      setAdding(true);
      try {
        /* Step 1: save the validated URL immediately. */
        const { status, project } = await createProject(basicProjectData(url));

        if (status === 409) {
          showToast(translate(content, lang, 'toast.duplicate'), 'error');
          setShake((n) => n + 1);
          return false;
        }
        if (status === 401) {
          showToast(translate(content, lang, 'toast.needOwner'), 'error');
          setIsOwner(false);
          setLoginOpen(true);
          return false;
        }
        if (!project) {
          showToast(translate(content, lang, 'toast.savefail'), 'error');
          setShake((n) => n + 1);
          return false;
        }

        /* Step 2: show the saved project straight away. */
        setProjects((prev) => [project, ...prev]);
        showToast(`${project.title} — ${translate(content, lang, 'toast.added')}`, 'success');
        requestAnimationFrame(() => {
          const card = document.querySelector(`.work-card[data-id="${project.id}"]`);
          card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        /* Step 3: enrich in the background. */
        enrichInBackground(project.id);
        return true;
      } catch {
        showToast(translate(content, lang, 'toast.savefail'), 'error');
        setShake((n) => n + 1);
        return false;
      } finally {
        setAdding(false);
      }
    },
    [content, lang, showToast, enrichInBackground],
  );

  const removeProjectAction = useCallback(
    async (id: string) => {
      try {
        const ok = await deleteProject(id);
        if (!ok) {
          showToast(translate(content, lang, 'toast.savefail'), 'error');
          return;
        }
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showToast(translate(content, lang, 'toast.removed'), 'success');
      } catch (error) {
        if (error instanceof Unauthorized) {
          showToast(translate(content, lang, 'toast.needOwner'), 'error');
          setIsOwner(false);
          setLoginOpen(true);
          return;
        }
        showToast(translate(content, lang, 'toast.savefail'), 'error');
      }
    },
    [content, lang, showToast],
  );

  const hideBuiltinSite = useCallback(
    async (id: string) => {
      const next = Array.from(new Set([...hiddenSiteIds(content), String(id)]));
      const saved = await saveField('site', 'hidden.sites', JSON.stringify(next));
      if (saved) showToast(translate(content, lang, 'card.hidden'), 'success');
    },
    [content, lang, saveField, showToast],
  );

  const restoreHiddenSites = useCallback(async () => {
    const ok = await resetField('site', 'hidden.sites');
    if (!ok) showToast(translate(content, lang, 'owner.resetfail'), 'error');
  }, [resetField, content, lang, showToast]);

  const setPerfLite = useCallback((lite: boolean) => setPerfLiteState(lite), []);

  const value = useMemo<SiteContextValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      content,
      projects,
      visible,
      contacts,
      showcase,
      hiddenCount: hiddenCountValue,
      isOwner,
      editing,
      deviceMode,
      toast,
      loginOpen,
      editorProject,
      introOpen,
      adding,
      perfLite,
      shake,
      t,
      list,
      base,
      setLang,
      setDeviceMode,
      showToast,
      saveField,
      resetField,
      setEditing,
      openLogin,
      closeLogin,
      submitLogin,
      submitLogout,
      openEditor,
      closeEditor,
      saveEditor,
      addByUrl,
      removeProject: removeProjectAction,
      hideBuiltinSite,
      restoreHiddenSites,
      setIntroOpen,
      setPerfLite,
    }),
    [
      lang,
      content,
      projects,
      visible,
      contacts,
      showcase,
      hiddenCountValue,
      isOwner,
      editing,
      deviceMode,
      toast,
      loginOpen,
      editorProject,
      introOpen,
      adding,
      perfLite,
      shake,
      t,
      list,
      base,
      setLang,
      setDeviceMode,
      showToast,
      saveField,
      resetField,
      setEditing,
      openLogin,
      closeLogin,
      submitLogin,
      submitLogout,
      openEditor,
      closeEditor,
      saveEditor,
      addByUrl,
      removeProjectAction,
      hideBuiltinSite,
      restoreHiddenSites,
      setPerfLite,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error('useSite must be used inside <SiteProvider>');
  return value;
}
