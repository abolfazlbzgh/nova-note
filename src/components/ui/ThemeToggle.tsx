'use client';

import {useTheme} from 'next-themes';
import {Sun, Moon} from 'lucide-react';

export default function ThemeToggle() {
  const {setTheme, resolvedTheme} = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <label className="swap swap-rotate btn btn-circle btn-ghost">
      <input type="checkbox" checked={isDark} onChange={() => setTheme(isDark ? 'light' : 'dark')} />
      <Sun className="swap-on h-5 w-5" />
      <Moon className="swap-off h-5 w-5" />
    </label>
  );
}
