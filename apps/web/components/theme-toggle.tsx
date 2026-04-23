'use client';

import { useTheme, type Theme } from './theme-provider';
import { MoonIcon, SunIcon, SystemIcon } from './icons';

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Midnight', icon: MoonIcon },
  { value: 'system', label: 'System', icon: SystemIcon },
];

/** Compact 3-segment switcher used in nav. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5 ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
              active
                ? 'bg-fg text-surface'
                : 'text-fg-subtle hover:bg-surface-sunken hover:text-fg'
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}

/** Larger labeled picker used inside Settings. */
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition ${
              active
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-card text-fg-muted hover:border-line-strong hover:text-fg'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
