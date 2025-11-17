import Fuse from 'fuse.js';
import { drugList } from './drugList';

// Initialize Fuse.js with drugList
const fuseSearch = new Fuse(drugList, {
  includeScore: true,
  threshold: 0.4,
  keys: ['name']
});

// Function to find closest matching drug using fuzzy search
export const findClosestDrug = (text: string): string | null => {
  if (!text) return null;

  const results = fuseSearch.search(text);
  if (results.length > 0 && results[0].score && results[0].score < 0.4) {
    return results[0].item;
  }
  return null;
};

// Function to handle speech recognition
export const startSpeechRecognition = (
  onResult: (text: string) => void,
  onError: (error: string) => void
): (() => void) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onerror = (event) => {
    onError(`Speech recognition error: ${event.error}`);
  };

  recognition.start();

  // Return cleanup function
  return () => {
    recognition.stop();
  };
};