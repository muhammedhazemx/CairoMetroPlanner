import React, { useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setLanguage } from '../features/planner/plannerSlice';

export const LanguageToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(state => state.planner.language);

  // Update document language and direction when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  const handleToggle = () => {
    const nextLang = currentLanguage === 'en' ? 'ar' : 'en';
    dispatch(setLanguage(nextLang));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text hover:bg-surface-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red/30 text-sm font-medium"
      aria-label={currentLanguage === 'en' ? 'Switch to Arabic' : 'تغيير اللغة إلى الإنجليزية'}
    >
      <Languages size={16} className="text-brand-red" />
      <span>{currentLanguage === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
};
