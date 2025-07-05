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
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { useNavigate } from "react-router-dom";

export function GameResults() {
  const { players, questions, resetGame } = useTriviaGame();
  const navigate = useNavigate();

  const [showCelebration, setShowCelebration] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  // Calculate stats from actual game data
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const totalQuestions = questions.length;
  const totalPlayers = players.length;
  const averageScore =
    totalPlayers > 0
      ? Math.round(
          (players.reduce((acc, p) => acc + p.score, 0) / totalPlayers) * 10
        ) / 10
      : 0;
  // For demo, gameTime, difficulty, category are not tracked in store, so use placeholders or settings if available
  const gameTime = "-";
  const difficulty = "-";
  const category = questions[0]?.category || "-";

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
    // If you have per-player answers, calculate correctAnswers, accuracy, etc. Otherwise, use score as correct answers
    const correctAnswers = player.score;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    // Placeholder for averageTime and streak
    return {
      correctAnswers,
      accuracy,
      averageTime: "-",
      streak: "-",
    };
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

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Winner Spotlight */}
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
                      {winner.score.toLocaleString()} Points
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Player Rankings */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              animateStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-400" />
                  Final Rankings
                </h3>
                <div className="space-y-4">
                  {sortedPlayers.map((player, index) => {
                    const stats = getPlayerStats(player);
                    return (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg transition-all duration-300 ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-400/30"
                            : index === 2
                            ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getRankIcon(index)}
                            <div>
                              <h4 className="font-semibold text-white text-lg">
                                {player.name}
                              </h4>
                              <p className="text-sm text-gray-300">
                                {getRankBadge(index)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">
                                  {player.score}
                                </p>
                                <p className="text-xs text-gray-300">Points</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold text-white">
                                  {stats.accuracy}%
                                </p>
                                <p className="text-xs text-gray-300">
                                  Accuracy
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold text-white">
                                  {stats.correctAnswers}/{totalQuestions}
                                </p>
                                <p className="text-xs text-gray-300">Correct</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Statistics */}
          <div
            className={`transition-all duration-1000 delay-700 ${
              animateStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-green-400" />
                  Game Statistics
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {totalQuestions}
                    </div>
                    <p className="text-gray-300">Questions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {totalPlayers}
                    </div>
                    <p className="text-gray-300">Players</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {averageScore}
                    </div>
                    <p className="text-gray-300">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {gameTime}
                    </div>
                    <p className="text-gray-300">Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div
            className={`text-center space-y-4 transition-all duration-1000 delay-1000 ${
              animateStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  resetGame();
                  navigate("/mode/local");
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-bold py-3 px-6"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
