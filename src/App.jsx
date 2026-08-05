import React, { useState, useMemo } from 'react';
import MainMenu from './components/MainMenu';
import Part1View from './components/Part1View';
import Part2View from './components/Part2View';
import ResultsView from './components/ResultsView';
import { SpeechService } from './utils/speech';

function App() {
  const [view, setView] = useState('menu'); // menu, part1, part2, results
  const [part1Score, setPart1Score] = useState(0);
  const [part2Score, setPart2Score] = useState(0);
  
  const speechService = useMemo(() => new SpeechService(), []);

  const handleStart = () => {
    setView('part1');
  };

  const handlePart1Finish = (score) => {
    setPart1Score(score);
    setView('part2');
  };

  const handlePart2Finish = (score) => {
    setPart2Score(score);
    setView('results');
  };

  const handleRestart = () => {
    setPart1Score(0);
    setPart2Score(0);
    setView('menu');
  };

  return (
    <>
      {view === 'menu' && <MainMenu onStart={handleStart} />}
      {view === 'part1' && <Part1View onFinish={handlePart1Finish} speechService={speechService} />}
      {view === 'part2' && <Part2View onFinish={handlePart2Finish} speechService={speechService} />}
      {view === 'results' && <ResultsView part1Score={part1Score} part2Score={part2Score} onRestart={handleRestart} />}
    </>
  );
}

export default App;
