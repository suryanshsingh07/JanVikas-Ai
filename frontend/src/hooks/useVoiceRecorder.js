import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useVoiceRecorder = (language = 'en-US') => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [resolvedLanguage, setResolvedLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en-US';
    if (language === 'auto') return navigator.language || 'en-US';
    return language;
  });
  const [recognitionError, setRecognitionError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const getRecognitionErrorMessage = (error) => {
    switch (error) {
      case 'network':
        return 'Speech recognition failed because the browser could not reach the recognition service. Check your connection and try again.';
      case 'not-allowed':
        return 'Microphone access was denied. Please allow microphone permissions to use voice dictation.';
      case 'service-not-allowed':
        return 'The browser blocked speech recognition service access. Please try again in a different browser or check your settings.';
      case 'no-speech':
        return 'No speech detected. Please speak clearly into the microphone.';
      case 'audio-capture':
        return 'Unable to capture audio from the microphone. Make sure your microphone is connected and enabled.';
      case 'aborted':
        return 'Speech recognition was aborted. You can try again.';
      default:
        return `Speech recognition error: ${error}`;
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (currentTranscript) {
            setTranscript(prev => prev + currentTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          const message = getRecognitionErrorMessage(event.error);
          setRecognitionError(message);
          if (event.error !== 'no-speech') {
            toast.error(message);
          }
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (stopError) {
              console.warn('Failed to stop recognition after error', stopError);
            }
          }
        };
      }
    }
    
    return () => stopRecording();
  }, []);

  // Update language when it changes
  useEffect(() => {
    const targetLanguage = language === 'auto'
      ? (typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US')
      : language;

    setResolvedLanguage(targetLanguage);
    if (recognitionRef.current) {
      recognitionRef.current.lang = targetLanguage;
    }
  }, [language]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      
      if (recognitionRef.current) {
        setTranscript('');
        setRecognitionError(null);
        try {
          recognitionRef.current.lang = resolvedLanguage;
          recognitionRef.current.start();
        } catch (e) {
          const message = getRecognitionErrorMessage(e.name || e.message || 'unknown');
          setRecognitionError(message);
          toast.error(message);
        }
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Failed to stop media recorder', e);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Failed to stop speech recognition', e);
        }
      }
      clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
      setRecognitionError(null);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setTranscript('');
    setRecordingTime(0);
  };

  return {
    isRecording,
    isPaused,
    transcript,
    setTranscript,
    audioBlob,
    recordingTime,
    recognitionError,
    startRecording,
    stopRecording,
    clearRecording,
    clearTranscript,
    hasSupport: !!recognitionRef.current
  };
};
