import { useAppSelector } from '../app/hooks';
import { en } from './en';
import { ar } from './ar';

export function useTranslation() {
  const language = useAppSelector(state => state.planner.language);
  const t = language === 'ar' ? ar : en;
  const isRtl = language === 'ar';

  return { t, language, isRtl };
}
export type TFunction = typeof en;
