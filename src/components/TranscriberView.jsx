import React, { useState, useEffect, useRef } from 'react';

export default function TranscriberView({ onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const pendingTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition API not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // Disable real-time interim results
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      pendingTranscriptRef.current = '';
    };
    
    recognition.onresult = (event) => {
      let finalStr = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + ' ';
        }
      }
      pendingTranscriptRef.current = finalStr;
    };
    
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      if (pendingTranscriptRef.current.trim() !== '') {
        setTranscript(prev => prev + (prev ? ' ' : '') + pendingTranscriptRef.current);
      }
      pendingTranscriptRef.current = '';
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
      // UI update happens automatically inside onend
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setError(e.message);
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
