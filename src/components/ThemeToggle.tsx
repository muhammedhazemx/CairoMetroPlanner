import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleTheme } from '../features/theme/themeSlice';

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-surface-2 transition-colors duration-200 text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
