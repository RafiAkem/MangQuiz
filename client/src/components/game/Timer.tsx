import { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { Clock } from 'lucide-react';

interface TimerProps {
  type: 'game' | 'question';
}

export function Timer({ type }: TimerProps) {
  const { 
    timeRemaining, 
    questionTimeRemaining, 
    settings, 
    updateTimer, 
    updateQuestionTimer,
    phase 
  } = useTriviaGame();

  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      if (type === 'game') {
        updateTimer();
      } else {
        updateQuestionTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [type, updateTimer, updateQuestionTimer, phase]);

  const time = type === 'game' ? timeRemaining : questionTimeRemaining * 1000;
  const maxTime = type === 'game' ? settings.gameDuration : settings.questionTime * 1000;
  const progress = (time / maxTime) * 100;

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (type === 'game') {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return remainingSeconds.toString();
    }
  };

  const getProgressColor = () => {
    if (progress > 60) return 'bg-green-500';
    if (progress > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isUrgent = progress < 20;

  return (
    <div className={`space-y-2 ${isUrgent ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-gray-600'}`} />
        <span className={`font-medium ${isUrgent ? 'text-red-500' : 'text-gray-900'}`}>
          {type === 'game' ? 'Game Time' : 'Question Time'}
        </span>
        <span className={`font-mono ${isUrgent ? 'text-red-500' : 'text-gray-700'}`}>
          {formatTime(time)}
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-2"
        />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
