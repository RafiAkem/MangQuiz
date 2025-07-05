import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Star,
  RotateCcw,
  Home,
  Crown,
  Target,
  Users,
  Clock,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface MultiplayerGameResultsProps {
  gameState: any;
  players: any[];
  playerId?: string;
}

export function MultiplayerGameResults({
  gameState,
  players,
  playerId,
}: MultiplayerGameResultsProps) {
  const navigate = useNavigate();

  const [showCelebration, setShowCelebration] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  // Calculate stats from multiplayer game data
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = gameState?.scores?.[a.id] || 0;
    const scoreB = gameState?.scores?.[b.id] || 0;
    return scoreB - scoreA;
  });

  const winner = sortedPlayers[0];
  const totalQuestions = gameState?.questions?.length || 0;
  const totalPlayers = players.length;
  const averageScore =
    totalPlayers > 0
      ? Math.round(
          (players.reduce(
            (acc, p) => acc + (gameState?.scores?.[p.id] || 0),
            0
          ) /
            totalPlayers) *
            10
        ) / 10
      : 0;

  useEffect(() => {
    // Trigger celebration animation
    const timer1 = setTimeout(() => setShowCelebration(true), 500);
    const timer2 = setTimeout(() => setAnimateStats(true), 1000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            {index + 1}
          </div>
        );
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return "🥇 Champion";
      case 1:
        return "🥈 Runner-up";
      case 2:
        return "🥉 Third Place";
      default:
        return `#${index + 1}`;
    }
  };

  // Calculate player stats (accuracy, correct answers, etc.)
  const getPlayerStats = (player: any) => {
    const correctAnswers = gameState?.scores?.[player.id] || 0;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    return {
      correctAnswers,
      accuracy,
      averageTime: "-",
      streak: "-",
    };
  };

  const handlePlayAgain = () => {
    navigate("/mode/multiplayer");
  };

  const handleGoHome = () => {
    navigate("/mode");
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Celebration particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`transition-all duration-1000 ${
              showCelebration ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Game Complete!
              </span>
            </h1>
            <p className="text-xl text-purple-200 font-medium">
              Congratulations to all players for a great game!
            </p>
          </div>
        </div>

        {/* Winner Card */}
        {winner && (
          <div
            className={`transition-all duration-1000 delay-300 ${
              showCelebration
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-pink-500/20 backdrop-blur-md border-yellow-400/30 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Trophy className="w-20 h-20 text-yellow-400 animate-pulse" />
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-white mb-2">
                  {winner.name}
                </h2>
                <p className="text-yellow-300 text-xl font-semibold mb-6">
                  Champion!
                </p>

                <div className="flex justify-center space-x-6">
                  <Badge className="bg-yellow-600 text-white px-4 py-2 text-lg font-bold">
                    {getPlayerStats(winner).correctAnswers} / {totalQuestions}{" "}
                    Correct
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-yellow-400 text-yellow-300 px-4 py-2 text-lg"
                  >
                    {getPlayerStats(winner).accuracy}% Accuracy
                  </Badge>
                  <Badge className="bg-purple-600 text-white px-4 py-2 text-lg font-bold">
                    {(gameState?.scores?.[winner.id] || 0).toLocaleString()}{" "}
                    Points
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Stats */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            animateStats
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl mt-8">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-purple-400" />
                Game Statistics
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {totalQuestions}
                  </div>
                  <div className="text-purple-200">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {totalPlayers}
                  </div>
                  <div className="text-purple-200">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {averageScore}
                  </div>
                  <div className="text-purple-200">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {winner ? getPlayerStats(winner).accuracy : 0}%
                  </div>
                  <div className="text-purple-200">Best Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Final Standings */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              animateStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-400" />
                  Final Standings
                </h3>

                <div className="space-y-4">
                  {sortedPlayers.map((player, index) => {
                    const stats = getPlayerStats(player);
                    const isCurrentPlayer = player.id === playerId;
                    return (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg transition-all duration-500 ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 transform scale-105"
                            : isCurrentPlayer
                            ? "bg-blue-500/20 border border-blue-400/30"
                            : "bg-white/5 border border-white/10"
                        }`}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getRankIcon(index)}
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: player.color || "#3b82f6",
                                }}
                              ></div>
                              <div>
                                <p className="font-bold text-white text-lg">
                                  {player.name}
                                  {isCurrentPlayer && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 text-xs"
                                    >
                                      You
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {getRankBadge(index)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-white text-xl">
                              {(
                                gameState?.scores?.[player.id] || 0
                              ).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-300">
                              {stats.accuracy}% correct
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div
            className={`transition-all duration-1000 delay-600 ${
              animateStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-green-400" />
                  What's Next?
                </h3>

                <div className="space-y-4">
                  <Button
                    onClick={handlePlayAgain}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg font-semibold"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </Button>

                  <Button
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 py-4 text-lg font-semibold"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Menu
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                  <p className="text-purple-200 text-sm text-center">
                    Thanks for playing QuizRush Multiplayer!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
