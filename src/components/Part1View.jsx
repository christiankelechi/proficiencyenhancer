import React, { useState, useRef } from 'react';
import { PART_1_PHRASES } from '../data/content';
import { scorePart1Response } from '../utils/scoring';

export default function Part1View({ onFinish, speechService }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("Click 'Play Phrase' to listen.");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scoreFeedback, setScoreFeedback] = useState(null);
  
  const totalScoreRef = useRef(0);
  
  const currentPhrase = PART_1_PHRASES[currentIndex];
  
  const handlePlay = async () => {
    setIsPlaying(true);
    setStatus("Playing phrase...");
    await speechService.speak(currentPhrase);
    setIsPlaying(false);
    setStatus("Now click 'Record Response' and repeat what you heard.");
  };
  
  const handleRecord = async () => {
    setIsRecording(true);
    setStatus("Recording... Please speak now.");
    
    try {
      const text = await speechService.listen(false);
      setIsRecording(false);
      
      const score = scorePart1Response(currentPhrase, text);
      totalScoreRef.current += score;
      
      if (!text) {
        setStatus("We didn't catch that. A partial response is better than no response! Score: 0");
        setScoreFeedback(`Score for this phrase: 0/100`);
      } else {
        setStatus(`You said: "${text}"`);
        setScoreFeedback(`Score for this phrase: ${score.toFixed(1)}/100`);
      }
    } catch (e) {
      setIsRecording(false);
      setStatus("Error accessing microphone: " + e.message);
      setScoreFeedback("Score for this phrase: 0/100 (Error)");
    }
  };
  
  const handleNext = () => {
    setScoreFeedback(null);
    if (currentIndex + 1 < PART_1_PHRASES.length) {
      setCurrentIndex(prev => prev + 1);
      setStatus("Click 'Play Phrase' to listen.");
    } else {
      const avgScore = totalScoreRef.current / PART_1_PHRASES.length;
      onFinish(avgScore);
    }
  };
  
  const progressPercent = (currentIndex / PART_1_PHRASES.length) * 100;
  
  return (
    <div className="container text-center">
      <h2 className="text-xl mb-4">Part 1: Listen & Repeat ({currentIndex + 1}/{PART_1_PHRASES.length})</h2>
      
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>
      
      <div className={`status-box ${isRecording ? 'pulse' : ''}`}>
        <div>
          <p>{status}</p>
          {scoreFeedback && <p className="text-success mt-4 font-bold">{scoreFeedback}</p>}
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={handlePlay} disabled={isPlaying || isRecording || scoreFeedback !== null}>
          Play Phrase
        </button>
        <button onClick={handleRecord} className="button-danger" disabled={isPlaying || isRecording || scoreFeedback !== null || status === "Click 'Play Phrase' to listen."}>
          {isRecording ? "Recording..." : "Record Response"}
        </button>
        <button onClick={handleNext} disabled={scoreFeedback === null}>
          Next
        </button>
      </div>
    </div>
  );
}
