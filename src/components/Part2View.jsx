import React, { useState, useEffect, useRef } from 'react';
import { PART_2_QUESTIONS } from '../data/content';

export default function Part2View({ onFinish, speechService }) {
  const [questions] = useState(() => [...PART_2_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle, prep, speak, done
  const [timeLeft, setTimeLeft] = useState(30);
  const [scoreFeedback, setScoreFeedback] = useState(null);
  
  const timerRef = useRef(null);
  const totalScoreRef = useRef(0);
  const timeSpokenRef = useRef(0);
  
  const currentQuestion = questions[currentIndex];
  
  const startQuestion = () => {
    setPhase('prep');
    setTimeLeft(30);
  };
  
  useEffect(() => {
    if (phase === 'prep') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            startSpeakingPhase();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'speak') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timerRef.current);
  }, [phase]);
  
  const startSpeakingPhase = async () => {
    setPhase('speak');
    setTimeLeft(60);
    timeSpokenRef.current = 0;
    try {
      speechService.listen(true).then((text) => {
         evaluateResponse(text);
      });
    } catch (e) {
      console.error(e);
      setScoreFeedback("Microphone Error: " + e.message);
      setPhase('done');
    }
  };
  
  const stopRecording = () => {
    clearInterval(timerRef.current);
    // Calculate how much time they actually spoke (60 minus whatever is left)
    // We use a functional update just to read the current state if needed, 
    // but React's state inside this closure might be stale. We can rely on timeLeft from render,
    // or better, use a ref or calculate it inside evaluateResponse.
    speechService.stop();
  };
  
  // This is called when the promise from listen() resolves (when stopped manually or due to timeout)
  const evaluateResponse = (text) => {
    // timeLeft could be stale here, so we read it by using a functional state update trick 
    // or we can just rely on a ref. Let's rely on timeSpokenRef tracking the actual time.
    // Instead of timeSpokenRef, let's just use the fact that if they stopped manually, 
    // timeLeft in state is what it is. To avoid stale state, we capture the time in the effect or rely on 60 - timeLeft.
    setTimeLeft((currentTimeLeft) => {
      const timeSpoken = 60 - currentTimeLeft;
      let score = 0;
      
      if (timeSpoken < 15) {
        setScoreFeedback(`Stopped at ${timeSpoken}s. Min 15s required! Score: 0/100`);
      } else {
        const wordCount = text ? text.trim().split(/\s+/).length : 0;
        if (wordCount > 20) score = 90;
        else if (wordCount > 10) score = 70;
        else score = 40;
        
        setScoreFeedback(`Finished at ${timeSpoken}s. Estimated Score: ${score}/100`);
      }
      
      totalScoreRef.current += score;
      setPhase('done');
      return currentTimeLeft;
    });
  };
  
  const handleNext = () => {
    setScoreFeedback(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setPhase('idle');
    } else {
      const avgScore = totalScoreRef.current / questions.length;
      onFinish(avgScore);
    }
  };
  
  const progressPercent = (currentIndex / questions.length) * 100;
  
  return (
    <div className="container text-center">
      <h2 className="text-xl mb-4">Part 2: Free Response ({currentIndex + 1}/{questions.length})</h2>
      
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>
      
      <div className="status-box">
        {phase === 'idle' ? (
          <p className="italic text-lg">Click 'Start Question' to begin.</p>
        ) : (
          <p className="font-bold text-lg">{currentQuestion}</p>
        )}
      </div>
      
      <div className="my-8">
        {phase === 'prep' && (
          <div className="text-warning text-2xl font-bold">Preparation Time: {timeLeft}s</div>
        )}
        {phase === 'speak' && (
          <div className="text-danger text-2xl font-bold pulse">Speaking Time: {timeLeft}s</div>
        )}
        {phase === 'done' && (
          <div className="text-success text-xl font-bold">{scoreFeedback}</div>
        )}
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={startQuestion} disabled={phase !== 'idle'}>
          Start Question
        </button>
        <button onClick={stopRecording} className="button-danger" disabled={phase !== 'speak'}>
          Stop Recording
        </button>
        <button onClick={handleNext} disabled={phase !== 'done'}>
          Next
        </button>
      </div>
    </div>
  );
}
