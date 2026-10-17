import { cn } from '@/lib/utils';

const stack = [
  { name: 'React', version: '19.2' },
  { name: 'Vite', version: '7.3' },
  { name: 'Tailwind CSS', version: '4.1' },
  { name: 'TypeScript', version: '5.9' },
];

export default function App() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* soft glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-violet/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-pink/10 blur-3xl"
      />

      <div className="relative w-full max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-4 py-1.5 text-xs font-semibold tracking-wide text-ink/70 shadow-sm">
          <span className="bg-gradient-brand h-2 w-2 rounded-full" />
          Project ready · المشروع جاهز
        </span>

        <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-6xl">
          <span className="text-gradient-brand">Pixelio</span>
          <span className="block text-ink">Studio Setup</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-ink/70 sm:text-lg">
          The exact configuration you sent is installed and running. Send the rest of the files and
          they will drop straight into <code className="rounded bg-ink/5 px-1.5 py-0.5 text-sm">src/</code>.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stack.map((item) => (
            <li
              key={item.name}
              className={cn(
                'rounded-2xl border border-ink/10 bg-surface p-4 text-left shadow-sm',
                'transition hover:-translate-y-0.5 hover:border-brand-violet/40 hover:shadow-md',
              )}
            >
              <span className="block text-sm font-semibold text-ink">{item.name}</span>
              <span className="block text-xs text-ink/55">v{item.version}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
