import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlayerSetup } from './PlayerSetup';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { Trophy, Users, Clock, Brain } from 'lucide-react';

export function GameLobby() {
  const { players, startGame } = useTriviaGame();

  const canStartGame = players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-blue-600" />
            History Trivia Challenge
          </h1>
          <p className="text-xl text-gray-600">Test your knowledge in 5-minute trivia battles!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Game Rules
              </CardTitle>
              <CardDescription>
                Quick trivia challenges for history enthusiasts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">5-Minute Challenges</p>
                  <p className="text-sm text-gray-600">Fast-paced trivia rounds</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">2-4 Players</p>
                  <p className="text-sm text-gray-600">Perfect for couch gaming</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Multiple Categories</p>
                  <p className="text-sm text-gray-600">Ancient, Medieval, Modern & more</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Answer multiple choice questions</li>
                  <li>• 15 seconds per question</li>
                  <li>• Earn points for correct answers</li>
                  <li>• Player with most points wins!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Player Setup */}
          <PlayerSetup />
        </div>

        {/* Start Game Button */}
        {players.length > 0 && (
          <div className="mt-8 text-center">
            <div className="mb-4">
              <Badge variant={canStartGame ? "default" : "secondary"} className="text-sm">
                {players.length}/4 Players Ready
              </Badge>
            </div>
            
            <Button
              onClick={startGame}
              disabled={!canStartGame}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              {canStartGame ? 'Start Trivia Challenge!' : 'Need at least 2 players'}
            </Button>
            
            {!canStartGame && players.length === 1 && (
              <p className="text-sm text-gray-500 mt-2">
                Add at least one more player to begin
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
