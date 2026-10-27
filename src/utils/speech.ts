/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode } from '../types';

export const LANG_BCP47_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

/**
 * Checks if the browser supports SpeechSynthesis
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Checks if the browser supports SpeechRecognition (Web Speech API)
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window ||
    'mozSpeechRecognition' in window
  );
}

/**
 * Reads aloud text in the given language
 */
export function speakText(
  text: string,
  lang: LanguageCode = 'en',
  onEnd?: () => void
): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis is not supported on this browser.');
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_BCP47_MAP[lang] || 'en-IN';
    utterance.rate = 0.95; // slightly slower for maximum clarity in regional dialects
    utterance.pitch = 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLang = LANG_BCP47_MAP[lang];
    const matchingVoice = voices.find((v) => v.lang === targetLang || v.lang.startsWith(lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Failed to trigger speech synthesis:', err);
    onEnd?.();
    return false;
  }
}

/**
 * Stops any active text-to-speech audio
 */
export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Voice input via browser Web Speech API
 */
export interface VoiceRecognitionController {
  stop: () => void;
  isSupported: boolean;
}

export function startVoiceRecognition(
  lang: LanguageCode,
  onResult: (transcript: string) => void,
  onError: (errorMessage: string) => void,
  onEnd: () => void
): VoiceRecognitionController {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please type your message.');
    onEnd();
    return { stop: () => {}, isSupported: false };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.lang = LANG_BCP47_MAP[lang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed') {
        onError('Microphone access was denied. Please allow microphone permissions or type instead.');
      } else if (event.error === 'no-speech') {
        onError('No speech was detected. Please try tapping and speaking again.');
      } else {
        onError(`Voice input error: ${event.error}`);
      }
      onEnd();
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
      isSupported: true,
    };
  } catch (err) {
    onError('Failed to initiate speech recognition.');
    onEnd();
    return { stop: () => {}, isSupported: false };
  }
}
