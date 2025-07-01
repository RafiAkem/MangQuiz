import { useEffect } from 'react';
import { Question } from './Question';
import { ScoreBoard } from './ScoreBoard';
import { GameResults } from './GameResults';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { useAudio } from '../../lib/stores/useAudio';

export function TriviaGame() {
  const { phase } = useTriviaGame();
  const { playSuccess, playHit } = useAudio();

  // Handle phase transitions for sound effects
  useEffect(() => {
    if (phase === 'final') {
      // Play success sound when game ends
      setTimeout(() => playSuccess(), 500);
    }
  }, [phase, playSuccess]);

  if (phase === 'final') {
    return <GameResults />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <Question />
        </div>
        
        {/* Sidebar with Scoreboard */}
        <div className="lg:col-span-1">
          <ScoreBoard />
        </div>
      </div>
    </div>
  );
}
