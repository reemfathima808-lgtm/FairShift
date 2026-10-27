/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { isSpeechRecognitionSupported, startVoiceRecognition, VoiceRecognitionController } from '../utils/speech';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  label?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  label,
}) => {
  const { language, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeController, setActiveController] = useState<VoiceRecognitionController | null>(null);

  const isSupported = isSpeechRecognitionSupported();

  const handleToggle = () => {
    setErrorMessage(null);

    if (isRecording) {
      activeController?.stop();
      setIsRecording(false);
      setActiveController(null);
      return;
    }

    if (!isSupported) {
      // Simulate quick voice dictation for demonstration on unsupported browser environments
      setErrorMessage('Speech API not supported in this browser. Simulated voice input added.');
      setTimeout(() => {
        const demoTranscripts: Record<string, string> = {
          en: 'Scaffolding pipe near north stairwell has loose locking pin and shakes during shift.',
          hi: 'उत्तर सीढ़ी के पास मचान की पाइप ढीली है और काम के दौरान हिल रही है।',
          ta: 'வடக்கு படிக்கட்டு அருகே உள்ள சாரக்கட்டு குழாயில் போல்ட் தளர்வாக உள்ளது, வேலை செய்யும் போது ஆடுகிறது.',
          te: 'ఉత్తర మెట్ల వద్ద స్కాఫోల్డింగ్ పైప్ లూజ్‌గా ఉంది మరియు పని సమయంలో కదులుతోంది.',
        };
        onTranscript(demoTranscripts[language] || demoTranscripts['en']);
        setErrorMessage(null);
      }, 700);
      return;
    }

    setIsRecording(true);
    const ctrl = startVoiceRecognition(
      language,
      (text) => {
        onTranscript(text);
      },
      (err) => {
        setErrorMessage(err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
        setActiveController(null);
      }
    );
    setActiveController(ctrl);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isRecording ? t('stopSpeaking') : label || t('voiceRecordHint')}
        className={`min-h-[48px] min-w-[48px] px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
          isRecording
            ? 'bg-red-600 text-white animate-pulse shadow-md ring-4 ring-red-200'
            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm active:scale-[0.98]'
        } ${className}`}
      >
        {isRecording ? (
          <>
            <MicOff className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t('listening')}</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label || t('voiceRecordHint')}</span>
          </>
        )}
      </button>

      {isRecording && (
        <p className="text-xs text-red-600 font-medium px-1 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          {t('speakNow')}
        </p>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
