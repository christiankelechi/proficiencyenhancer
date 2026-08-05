import React, { useState, useEffect, useRef } from 'react';
import WhisperWorker from '../utils/whisperWorker?worker';
import { processAudioBlob } from '../utils/audioUtils';

export default function TranscriberView({ onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new WhisperWorker();
    
    workerRef.current.onmessage = (event) => {
      const { status, data, transcript: newText, error: workerError } = event.data;
      
      if (status === 'progress') {
        if (data.status === 'downloading') {
           setModelStatus(`Downloading Local AI Model: ${data.file} (${Math.round(data.progress)}%)`);
        } else if (data.status === 'init') {
           setModelStatus('Initializing AI...');
        } else if (data.status === 'ready') {
           setModelStatus(null);
        }
      } else if (status === 'processing') {
        setIsProcessing(true);
        setModelStatus('AI is transcribing audio...');
      } else if (status === 'complete') {
        setIsProcessing(false);
        setModelStatus(null);
        setTranscript(prev => prev + (prev ? ' ' : '') + newText);
      } else if (status === 'error') {
        setIsProcessing(false);
        setModelStatus(null);
        setError(`Transcription Error: ${workerError}`);
      }
    };
    
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorderRef.current.onstop = async () => {
          // Stop all microphone tracks to release the mic
          stream.getTracks().forEach(track => track.stop());
          
          if (audioChunksRef.current.length === 0) return;
          
          setIsProcessing(true);
          setModelStatus('Processing audio recording...');
          
          try {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const float32Array = await processAudioBlob(blob);
            
            // Send to worker
            workerRef.current.postMessage({ audioData: float32Array });
          } catch (err) {
            setError(`Failed to process audio: ${err.message}`);
            setIsProcessing(false);
            setModelStatus(null);
          }
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setError("Microphone access denied or error: " + e.message);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="container text-center">
      <h2 className="text-xl mb-4">Local AI Practice Transcriber</h2>
      
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
            Recording audio... (Click stop to process)
          </div>
        )}

        {isProcessing && modelStatus && (
          <div className="mt-4" style={{ color: '#8b5cf6', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
            <span className="pulse d-inline-block mr-2">⚙️</span> {modelStatus}
          </div>
        )}
        
        {!transcript && !isRecording && !isProcessing && (
          <p className="italic text-secondary" style={{ width: '100%', textAlign: 'center', marginTop: '60px' }}>
            Click "Start Recording" and speak. It will be transcribed privately on your device.
          </p>
        )}
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack} disabled={isRecording || isProcessing}>
          Back to Menu
        </button>
        <button 
          onClick={toggleRecording} 
          className={isRecording ? "button-danger pulse" : ""}
          style={!isRecording ? { backgroundColor: '#10b981' } : {}}
          disabled={isProcessing}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button onClick={clearTranscript} disabled={!transcript || isRecording || isProcessing}>
          Clear Text
        </button>
      </div>
    </div>
  );
}
