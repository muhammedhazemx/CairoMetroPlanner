import React from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface LineBadgeProps {
  lineId: string;
  className?: string;
}

export const LineBadge: React.FC<LineBadgeProps> = ({ lineId, className = '' }) => {
  const { language } = useTranslation();

  // Color mapping matching emblem Look & Feel requirements
  const colors: Record<string, { bg: string; text: string; nameEn: string; nameAr: string }> = {
    L1: {
      bg: 'bg-line-l1/10 border-line-l1',
      text: 'text-line-l1',
      nameEn: 'Line 1',
      nameAr: 'الخط 1'
    },
    L2: {
      bg: 'bg-line-l2/10 border-line-l2',
      text: 'text-line-l2',
      nameEn: 'Line 2',
      nameAr: 'الخط 2'
    },
    L3: {
      bg: 'bg-line-l3/10 border-line-l3',
      text: 'text-line-l3',
      nameEn: 'Line 3',
      nameAr: 'الخط 3'
    }
  };

  const lineInfo = colors[lineId] || {
    bg: 'bg-surface-2 border-border',
    text: 'text-text-muted',
    nameEn: lineId,
    nameAr: lineId
  };

  const displayName = language === 'ar' ? lineInfo.nameAr : lineInfo.nameEn;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${lineInfo.bg} ${lineInfo.text} ${className}`}
      aria-label={`Metro ${lineInfo.nameEn}`}
    >
      {displayName}
    </span>
  );
};
