import React from 'react';

export default function ResultsView({ part1Score, part2Score, onRestart }) {
  const overallScore = (part1Score + part2Score) / 2;
  const isPassing = overallScore >= 85;
  
  return (
    <div className="container text-center">
      <h1 className="text-2xl mb-4">Assessment Complete</h1>
      
      <div className="my-8">
        <h2 className={`text-2xl font-bold ${isPassing ? 'text-success' : 'text-danger'}`}>
          Overall Estimated Score: {overallScore.toFixed(1)}/100
        </h2>
      </div>
      
      <div className="status-box" style={{ flexDirection: 'column', gap: '10px' }}>
        <p className="text-lg">Part 1 (Listen & Repeat): <b>{part1Score.toFixed(1)}/100</b></p>
        <p className="text-lg">Part 2 (Free Response): <b>{part2Score.toFixed(1)}/100</b></p>
      </div>
      
      <p className="italic mt-8 text-lg">
        {isPassing 
          ? "Excellent! You are well prepared for the Crossover assessment." 
          : "Keep practicing! Focus on repeating every word exactly in Part 1, and speaking for the full time in Part 2."}
      </p>
      
      <div className="flex justify-center mt-8">
        <button onClick={onRestart} style={{ padding: '12px 32px' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
