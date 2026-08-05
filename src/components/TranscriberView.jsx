import React, { useState, useEffect, useRef } from 'react';

export default function TranscriberView({ onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const lastFinalizedIndex = useRef(-1);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition API not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      lastFinalizedIndex.current = -1;
    };
    
    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          if (i > lastFinalizedIndex.current) {
            finalStr += event.results[i][0].transcript + ' ';
            lastFinalizedIndex.current = i;
          }
        } else {
          interimStr += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalStr) {
        setTranscript(prev => prev + finalStr);
      }
      setInterimTranscript(interimStr);
    };
    
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
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
      setIsRecording(false);
      setInterimTranscript('');
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
    setInterimTranscript('');
  };

  return (
    <div className="container text-center">
      <h2 className="text-xl mb-4">Free Practice Transcriber</h2>
      
      {error && <p className="text-danger mb-4 font-bold">{error}</p>}
      
      <div className="status-box" style={{ 
        minHeight: '200px', 
        alignItems: 'flex-start', 
        justifyContent: 'flex-start', 
        textAlign: 'left',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <p className="text-lg">
          {transcript}
          <span style={{ color: '#94a3b8' }}>{interimTranscript}</span>
        </p>
        {!transcript && !interimTranscript && !isRecording && (
          <p className="italic text-secondary" style={{ width: '100%', textAlign: 'center', marginTop: '60px' }}>
            Click "Start Recording" and begin speaking...
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
        <button onClick={clearTranscript} disabled={!transcript && !interimTranscript}>
          Clear Text
        </button>
      </div>
    </div>
  );
}
