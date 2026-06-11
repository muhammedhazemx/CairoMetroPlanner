import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useAppDispatch } from '../app/hooks';
import { swapOriginDestination } from '../features/planner/plannerSlice';
import { useTranslation } from '../i18n/useTranslation';

export const SwapButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleSwap = () => {
    dispatch(swapOriginDestination());
  };

  return (
    <div className="flex justify-center my-1">
      <button
        type="button"
        onClick={handleSwap}
        aria-label={t.swapStations}
        title={t.swapStations}
        className="p-2.5 rounded-full bg-brand-red text-white shadow-sm transition-all duration-300 hover:rotate-180 hover:bg-brand-red/90 focus:outline-none focus:ring-2 focus:ring-brand-red/30 active:scale-95"
      >
        <ArrowUpDown size={18} />
      </button>
    </div>
  );
};
