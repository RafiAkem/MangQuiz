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
import { supabase } from "@/lib/supabaseClient";
import { AuthModal } from "./AuthModal";
import { useNavigate } from "react-router-dom";

export function GameResults() {
  const { players, questions, resetGame } = useTriviaGame();
  const navigate = useNavigate();

  const [showCelebration, setShowCelebration] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [scoreSaved, setScoreSaved] = useState<
    null | "saved" | "guest" | "error"
  >(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  // Fetch user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Save winner's score to Supabase leaderboard if logged in
  useEffect(() => {
    async function saveScore() {
      if (!winner) return;
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setScoreSaved("guest");
        return;
      }
      // Save to leaderboard
      const { error } = await supabase.from("leaderboard").insert([
        {
          user_id: user.id,
          player_name: winner.name,
          score: winner.score,
          accuracy:
            totalQuestions > 0
              ? Math.round((winner.score / totalQuestions) * 100)
              : null,
        },
      ]);
      if (error) setScoreSaved("error");
      else setScoreSaved("saved");
    }
    saveScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, user]);

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

                  {/* Score save status */}
                  {scoreSaved === "saved" && (
                    <p className="text-green-400 mt-4">
                      Score saved to leaderboard!
                    </p>
                  )}
                  {scoreSaved === "guest" && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <p className="text-yellow-300">
                        Sign in to save your score to the leaderboard.
                      </p>
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                        onClick={() => setShowAuthModal(true)}
                      >
                        Sign In / Register
                      </Button>
                    </div>
                  )}
                  {scoreSaved === "error" && (
                    <p className="text-red-400 mt-4">
                      Failed to save score. Try again later.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

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
                      return (
                        <div
                          key={player.id}
                          className={`p-4 rounded-lg transition-all duration-500 ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 transform scale-105"
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
                                  style={{ backgroundColor: player.color }}
                                ></div>
                                <div>
                                  <p className="font-bold text-white text-lg">
                                    {player.name}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {getRankBadge(index)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-white text-xl">
                                {player.score.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-300">
                                {stats.accuracy}% correct
                              </p>
                            </div>
                          </div>

                          {/* Player Stats */}
                          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-green-400">
                                {stats.correctAnswers}
                              </p>
                              <p className="text-xs text-gray-400">Correct</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-blue-400">
                                {stats.averageTime}
                              </p>
                              <p className="text-xs text-gray-400">Avg Time</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-orange-400">
                                {stats.streak}
                              </p>
                              <p className="text-xs text-gray-400">
                                Best Streak
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Accuracy</span>
                              <span>{stats.accuracy}%</span>
                            </div>
                            <Progress
                              value={stats.accuracy}
                              className="h-2 bg-white/20"
                            />
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
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Brain className="w-6 h-6 mr-3 text-purple-400" />
                    Game Statistics
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Target className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-3xl font-bold text-blue-400">
                        {totalQuestions}
                      </p>
                      <p className="text-sm text-gray-300">Questions Asked</p>
                    </div>

                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Users className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold text-green-400">
                        {totalPlayers}
                      </p>
                      <p className="text-sm text-gray-300">Players</p>
                    </div>

                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Star className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="text-3xl font-bold text-purple-400">
                        {averageScore}
                      </p>
                      <p className="text-sm text-gray-300">Average Score</p>
                    </div>

                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Clock className="w-8 h-8 text-yellow-400" />
                      </div>
                      <p className="text-3xl font-bold text-yellow-400">
                        {gameTime}
                      </p>
                      <p className="text-sm text-gray-300">Game Time</p>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <Badge
                        variant="outline"
                        className="border-purple-400 text-purple-300"
                      >
                        {category}
                      </Badge>
                      <Badge className="bg-yellow-600 text-white">
                        {difficulty}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        Highest Score:{" "}
                        <span className="text-white font-bold">
                          {winner?.score?.toLocaleString?.() ?? "-"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Best Accuracy:{" "}
                        <span className="text-white font-bold">
                          {Math.max(
                            ...sortedPlayers.map(
                              (p) => getPlayerStats(p).accuracy
                            )
                          )}
                          %
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 text-lg shadow-2xl transform transition-all duration-200 hover:scale-105"
                onClick={() => {
                  localStorage.removeItem("quizrush-localgame");
                  resetGame();
                  navigate("/game");
                }}
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                Play Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-bold py-4 px-8 text-lg"
                onClick={() => {
                  resetGame();
                  navigate("/mode/local");
                }}
              >
                <Home className="w-6 h-6 mr-2" />
                Main Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={async () => {
            // After auth, update user and re-attempt save
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setShowAuthModal(false);
            setScoreSaved(null); // triggers useEffect to save again
          }}
        />
      )}
    </div>
  );
}
