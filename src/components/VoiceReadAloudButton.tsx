/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface VoiceReadAloudButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceReadAloudButton: React.FC<VoiceReadAloudButtonProps> = ({
  textToSpeak,
  label,
  className = '',
  size = 'md',
}) => {
  const { readAloud, stopAudio, isSpeaking, t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopAudio();
    } else {
      readAloud(textToSpeak);
    }
  };

  const buttonSizeClass =
    size === 'lg'
      ? 'min-h-[52px] min-w-[52px] px-4 py-2.5 text-base'
      : size === 'sm'
      ? 'min-h-[44px] min-w-[44px] px-2.5 py-1.5 text-xs'
      : 'min-h-[48px] min-w-[48px] px-3.5 py-2 text-sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSpeaking ? t('stopSpeaking') : label || t('readAloud')}
      title={isSpeaking ? t('stopSpeaking') : label || t('readAloud')}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all cursor-pointer ${
        isSpeaking
          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 active:scale-[0.98]'
      } ${buttonSizeClass} ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('stopSpeaking')}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-blue-700 shrink-0" aria-hidden="true" />
          {label && <span className="truncate">{label}</span>}
        </>
      )}
    </button>
  );
};
