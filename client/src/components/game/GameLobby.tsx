import { useState, useEffect } from "react";
import {
  Play,
  Users,
  Trophy,
  Settings,
  Clock,
  Brain,
  Star,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { Leaderboard } from "./Leaderboard";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export function GameLobby() {
  const {
    players,
    addPlayer,
    removePlayer,
    startGame,
    settings,
    phase,
    // Add a way to update settings if needed
  } = useTriviaGame();

  const [newPlayerName, setNewPlayerName] = useState("");
  // Local state for settings, since store does not have difficulty/category directly
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("all");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 4) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  // Optionally, update store settings when local settings change (not implemented in store yet)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50 flex items-center space-x-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/mode")}
          className="bg-white/10 text-white border-white/20"
        >
          &#8592; Back
        </Button>
        {/* Auth/User Bar */}
        {user ? (
          <>
            <span className="text-white/80 text-sm">
              Signed in as {user.email}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
              className="bg-white/10 text-white border-white/20"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAuthModal(true)}
            className="bg-white/10 text-white border-white/20"
          >
            Sign In
          </Button>
        )}
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              MangQuiz
            </h1>
          </div>
          <p className="text-xl text-blue-200 font-medium">
            Test your knowledge in epic 5-minute trivia battles!
          </p>
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-blue-300">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              5-minute rounds
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              2-4 players
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Multiple categories
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Game Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Setup */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Player Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter player name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-white/10 border-white/30 text-white placeholder-white/60"
                    disabled={players.length >= 4}
                  />
                  <Button
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim() || players.length >= 4}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {players.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-200">
                      Players ({players.length}/4):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {players.map((player, index) => (
                        <Badge
                          key={player.id}
                          variant="secondary"
                          className="bg-blue-600/50 text-white border-blue-400/50 pr-1"
                        >
                          {player.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlayer(player.id)}
                            className="ml-1 h-4 w-4 p-0 hover:bg-red-500/50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {players.length === 0 && (
                  <div className="text-center py-8 text-blue-300">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Add 2-4 players to start the game</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Game Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Difficulty Level
                    </label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">🟢 Easy</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="hard">🔴 Hard</SelectItem>
                        <SelectItem value="expert">⚫ Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Category Focus
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🌍 All Periods</SelectItem>
                        <SelectItem value="ancient">
                          🏛️ Ancient History
                        </SelectItem>
                        <SelectItem value="medieval">
                          ⚔️ Medieval Times
                        </SelectItem>
                        <SelectItem value="modern">🏭 Modern Era</SelectItem>
                        <SelectItem value="contemporary">
                          🚀 Contemporary
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-400/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Game Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-100">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>5-minute lightning rounds</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Brain className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span>Multiple choice questions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <span>15 seconds per question</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Trophy className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                  <span>Points for speed & accuracy</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                disabled={players.length < 2}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 text-lg shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={() => {
                  startGame();
                  navigate("/game");
                }}
              >
                <Play className="w-6 h-6 mr-2" />
                Start Game
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 text-lg shadow-2xl transform transition-all duration-200 hover:scale-105 border-purple-400/30"
                onClick={() => navigate("/custom-questions")}
              >
                <Sparkles className="w-6 h-6 mr-2" />
                AI-Generated Questions
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => setShowLeaderboard(true)}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  disabled
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Quick Tips */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardContent className="pt-6">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  Pro Tips
                </h3>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• Answer quickly for bonus points</li>
                  <li>• Study all historical periods</li>
                  <li>• Practice makes perfect!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl mx-auto">
            <button
              className="absolute top-2 right-2 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 z-10"
              onClick={() => setShowLeaderboard(false)}
              aria-label="Close leaderboard"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <Leaderboard />
          </div>
        </div>
      )}
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={() => {
            supabase.auth.getUser().then(({ data }) => setUser(data.user));
          }}
        />
      )}
    </div>
  );
}
