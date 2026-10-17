import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const ICONS: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

/** Cycles light → dark → system. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useTheme();
  const { ui } = useLanguage();
  const Icon = ICONS[theme];
  const label = `${ui.theme}: ${ui[theme]}`;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className={cn('rounded-full border-border bg-card', className)}
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  );
}
