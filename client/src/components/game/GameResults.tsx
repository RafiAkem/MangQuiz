import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { Trophy, Medal, Award, RotateCcw, Users } from 'lucide-react';

export function GameResults() {
  const { players, questions, resetGame } = useTriviaGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 1:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 2:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">{position + 1}</div>;
    }
  };

  const getPositionText = (position: number) => {
    switch (position) {
      case 0:
        return "Winner!";
      case 1:
        return "2nd Place";
      case 2:
        return "3rd Place";
      default:
        return `${position + 1}th Place`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Complete!</h1>
          <p className="text-xl text-gray-600">
            Congratulations to all players for a great game!
          </p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{winner.name}</h2>
                  <p className="text-xl text-gray-600">Champion!</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Badge className="text-lg px-4 py-2 bg-yellow-500">
                    {winner.score} / {questions.length} Correct
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {((winner.score / questions.length) * 100).toFixed(0)}% Accuracy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Final Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index === 0 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : index === 1
                      ? 'bg-gray-50 border-gray-200'
                      : index === 2
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getPositionIcon(index)}
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <div>
                      <h3 className="text-lg font-bold">{player.name}</h3>
                      <p className="text-sm text-gray-600">{getPositionText(index)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">{player.score}</div>
                    <div className="text-sm text-gray-500">
                      {((player.score / questions.length) * 100).toFixed(0)}% correct
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{players.length}</div>
                <div className="text-sm text-gray-600">Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(players.reduce((acc, p) => acc + p.score, 0) / players.length * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Play Again */}
        <div className="text-center">
          <Button
            onClick={resetGame}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
