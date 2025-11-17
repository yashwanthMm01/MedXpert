import React, { useState } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { startSpeechRecognition } from '../utils/textRecognition';

interface VoiceInputProps {
  onResult: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const handleVoiceInput = () => {
    if (isListening) return;

    setIsListening(true);
    setError('');

    const stopListening = startSpeechRecognition(
      (text) => {
        onResult(text);
        setIsListening(false);
      },
      (error) => {
        setError(error);
        setIsListening(false);
      }
    );

    // Automatically stop after 5 seconds
    setTimeout(() => {
      stopListening();
      setIsListening(false);
    }, 5000);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleVoiceInput}
        disabled={isListening}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isListening
            ? 'bg-purple-600 text-white'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        {isListening ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Listening...
          </>
        ) : (
          <>
            <Mic size={20} />
            Click to Speak
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;