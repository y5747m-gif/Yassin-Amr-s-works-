import { Languages } from 'lucide-react';
import { LOCALES, useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** EN / عربي switch — flips <html dir> and the whole copy tree. */
export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, ui } = useLanguage();

  return (
    <div
      role="group"
      aria-label={ui.language}
      className={cn('inline-flex items-center gap-1 rounded-full border border-border bg-card p-1', className)}
    >
      <Languages className="ms-1.5 size-3.5 text-muted-foreground" aria-hidden />
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          aria-pressed={locale === item}
          className={cn(
            'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300',
            locale === item
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item === 'en' ? 'EN' : 'عربي'}
        </button>
      ))}
    </div>
  );
}
