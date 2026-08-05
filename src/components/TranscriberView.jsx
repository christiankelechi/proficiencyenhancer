import React, { useState, useEffect, useRef } from 'react';

export default function TranscriberView({ onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const pendingTranscriptRef = useRef('');
  const isRecordingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition API not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Magic fix: use non-continuous and restart manually
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      // In non-continuous mode, there's always exactly one result at index 0
      if (event.results.length > 0) {
        pendingTranscriptRef.current += event.results[0][0].transcript + ' ';
      }
    };
    
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      if (isRecordingRef.current) {
        // Automatically restart to simulate continuous mode perfectly
        try {
          recognition.start();
        } catch (e) {}
      } else {
        // Only update UI when recording has fully stopped
        if (pendingTranscriptRef.current.trim() !== '') {
          setTranscript(prev => prev + (prev ? ' ' : '') + pendingTranscriptRef.current);
        }
        pendingTranscriptRef.current = '';
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      recognitionRef.current.stop();
    } else {
      setError(null);
      isRecordingRef.current = true;
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setError(e.message);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    pendingTranscriptRef.current = '';
  };

  return (
    <div className="container text-center">
      <h2 className="text-xl mb-4">Batch Practice Transcriber</h2>
      
      {error && <p className="text-danger mb-4 font-bold">{error}</p>}
      
      <div className="status-box" style={{ 
        minHeight: '200px', 
        alignItems: 'flex-start', 
        justifyContent: 'flex-start', 
        textAlign: 'left',
        padding: '20px',
        overflowY: 'auto',
        flexDirection: 'column'
      }}>
        <p className="text-lg">
          {transcript}
        </p>
        
        {isRecording && (
          <div className="mt-4 pulse" style={{ color: '#10b981', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
            Recording in progress... (Audio will be transcribed when you hit stop)
          </div>
        )}
        
        {!transcript && !isRecording && (
          <p className="italic text-secondary" style={{ width: '100%', textAlign: 'center', marginTop: '60px' }}>
            Click "Start Recording" and speak. It will transcribe once you stop.
          </p>
        )}
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack}>
          Back to Menu
        </button>
        <button 
          onClick={toggleRecording} 
          className={isRecording ? "button-danger pulse" : ""}
          style={!isRecording ? { backgroundColor: '#10b981' } : {}}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button onClick={clearTranscript} disabled={!transcript}>
          Clear Text
        </button>
      </div>
    </div>
  );
}
