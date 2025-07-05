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
  const navigate = useNavigate();

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
      <div className="absolute top-4 left-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/mode")}
          className="bg-white/10 text-white border-white/20"
        >
          &#8592; Back
        </Button>
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
                            size="sm"
                            variant="ghost"
                            onClick={() => removePlayer(player.id)}
                            className="ml-2 h-4 w-4 p-0 text-white hover:bg-blue-500/50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-green-400" />
                  Game Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Difficulty
                    </label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="literature">Literature</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="entertainment">
                          Entertainment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Game Button */}
            <div className="text-center">
              <Button
                onClick={startGame}
                disabled={players.length < 2}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg shadow-2xl"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Game
              </Button>
              {players.length < 2 && (
                <p className="text-yellow-300 mt-2 text-sm">
                  Add at least 2 players to start
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Game Info</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Players:</span>
                    <span className="text-white">{players.length}/4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Difficulty:</span>
                    <span className="text-white capitalize">{difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Category:</span>
                    <span className="text-white capitalize">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Duration:</span>
                    <span className="text-white">5 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Tips</h3>
                </div>
                <div className="space-y-2 text-sm text-blue-200">
                  <p>• Answer quickly to earn bonus points</p>
                  <p>• Work together with your team</p>
                  <p>• Use the timer to your advantage</p>
                  <p>• Have fun and learn something new!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
