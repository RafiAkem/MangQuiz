import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer } from './Timer';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { Trophy, Medal, Award } from 'lucide-react';

export function ScoreBoard() {
  const { players, questions, currentQuestionIndex } = useTriviaGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 0:
        return "1st";
      case 1:
        return "2nd";
      case 2:
        return "3rd";
      case 3:
        return "4th";
      default:
        return `${position + 1}th`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scoreboard</span>
          <Badge variant="outline">
            Question {currentQuestionIndex + 1}/{questions.length}
          </Badge>
        </CardTitle>
        <Timer type="game" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getPositionIcon(index)}
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-medium">{player.name}</span>
                <Badge variant="outline" className="text-xs">
                  {getPositionBadge(index)}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{player.score}</div>
                <div className="text-xs text-gray-500">
                  {((player.score / Math.max(1, currentQuestionIndex)) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
