import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MultiplayerGameResults } from "./MultiplayerGameResults";
import { useAudio } from "../../lib/stores/useAudio";
import { useWebSocket } from "../../lib/contexts/WebSocketContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Users,
  Trophy,
  Zap,
  Eye,
} from "lucide-react";

interface MultiplayerTriviaGameProps {
  playerId?: string;
  players?: any[];
}

export function MultiplayerTriviaGame({
  playerId,
  players,
}: MultiplayerTriviaGameProps) {
  const { wsRef } = useWebSocket();
  const [mpState, setMpState] = useState<any>(null); // { questionIndex, questions, answers, scores, phase, questionTimeRemaining, revealTimeRemaining }
  const { playSuccess } = useAudio();
  const [resolvedPlayerId, setResolvedPlayerId] = useState<string | undefined>(
    playerId
  );

  // Always use playerId from localStorage for robust identification
  useEffect(() => {
    const storedPlayerId = localStorage.getItem("quizRushPlayerId");

    if (storedPlayerId) {
      setResolvedPlayerId(storedPlayerId);
    } else if (playerId) {
      setResolvedPlayerId(playerId);
    }
  }, [playerId]);

  // Listen for multiplayer game state updates
  useEffect(() => {
    if (!wsRef?.current) return;
    const ws = wsRef.current;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "game_state") {
        setMpState(data.state);
      }
      if (data.type === "game_end") {
        setMpState((prev: any) => ({ ...prev, phase: "final" }));
        setTimeout(() => playSuccess(), 500);
      }
    };
    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [wsRef, playSuccess]);

  // Send answer to server in multiplayer
  const handleAnswer = (answer: string) => {
    if (!wsRef?.current) {
      return;
    }

    if (!mpState) {
      return;
    }

    if (!resolvedPlayerId) {
      return;
    }

    if (mpState.phase !== "playing") {
      return;
    }

    if (mpState.answers?.[resolvedPlayerId]) {
      return;
    }

    const message = {
      type: "answer",
      answer,
      playerId: resolvedPlayerId,
    };

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!mpState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Waiting for game to start...
          </h2>
          <p className="text-purple-200">
            The host will begin the game shortly
          </p>
        </div>
      </div>
    );
  }

  if (mpState.phase === "final") {
    return (
      <MultiplayerGameResults
        gameState={mpState}
        players={players || []}
        playerId={resolvedPlayerId}
      />
    );
  }

  const currentQ = mpState.questions[mpState.questionIndex];
  const hasAnswered = resolvedPlayerId
    ? !!mpState.answers?.[resolvedPlayerId]
    : false;
  const totalAnswered = Object.keys(mpState.answers || {}).length;
  const isRevealPhase = mpState.phase === "reveal";
  const isPlayingPhase = mpState.phase === "playing";
  const progress =
    ((mpState.questionIndex + 1) / mpState.questions.length) * 100;

  // Get the correct answer for reveal phase
  const correctAnswer = currentQ.answer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Multiplayer Trivia Challenge
              </h1>
              <p className="text-purple-200 text-sm">
                Question {mpState.questionIndex + 1} of{" "}
                {mpState.questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Timer Display */}
            <div className="w-48">
              {isPlayingPhase &&
                mpState.questionTimeRemaining !== undefined && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-200 text-xs font-semibold">
                        Time Left
                      </span>
                      <span className="text-white font-mono text-lg font-bold">
                        {mpState.questionTimeRemaining ?? 0}s
                      </span>
                    </div>
                    <div className="relative w-full">
                      <Progress
                        value={
                          ((mpState.questionTimeRemaining ?? 0) / 20) * 100
                        }
                        className="h-3 bg-white/20"
                      />
                      <div
                        className={`h-3 rounded-full absolute top-0 left-0 transition-all duration-1000 ${
                          (mpState.questionTimeRemaining ?? 0) <= 5
                            ? "bg-red-500"
                            : (mpState.questionTimeRemaining ?? 0) <= 10
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${
                            ((mpState.questionTimeRemaining ?? 0) / 20) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </>
                )}

              {isRevealPhase && mpState.revealTimeRemaining !== undefined && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-200 text-xs font-semibold">
                      Next Question
                    </span>
                    <span className="text-white font-mono text-lg font-bold">
                      {mpState.revealTimeRemaining ?? 0}s
                    </span>
                  </div>
                  <div className="relative w-full">
                    <Progress
                      value={((mpState.revealTimeRemaining ?? 0) / 2) * 100}
                      className="h-3 bg-white/20"
                    />
                    <div
                      className="h-3 rounded-full absolute top-0 left-0 transition-all duration-1000 bg-purple-500"
                      style={{
                        width: `${
                          ((mpState.revealTimeRemaining ?? 0) / 2) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </>
              )}
            </div>

            {currentQ.difficulty && (
              <Badge
                className={`${getDifficultyColor(
                  currentQ.difficulty
                )} text-white px-3 py-1`}
              >
                {currentQ.difficulty.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="outline"
                    className="border-purple-400 text-purple-300 bg-purple-400/10"
                  >
                    {currentQ.category || "General"}
                  </Badge>
                  <div className="flex items-center space-x-2 text-white">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Question {mpState.questionIndex + 1} of{" "}
                      {mpState.questions.length}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
                  {currentQ.question}
                </h2>

                {/* Progress Bar */}
                <div className="mb-8">
                  <Progress value={progress} className="h-2 bg-white/20" />
                </div>

                {/* Answer Options */}
                <div className="grid md:grid-cols-2 gap-4">
                  {currentQ.options.map((option: string, idx: number) => {
                    const isSelected =
                      resolvedPlayerId &&
                      mpState.answers?.[resolvedPlayerId] === option;
                    const isCorrect = option === correctAnswer;

                    // Determine styling based on phase and correctness
                    let cardStyle = "";
                    let isDisabled = false;

                    if (isRevealPhase) {
                      // In reveal phase, show correct/incorrect answers
                      if (isCorrect) {
                        cardStyle =
                          "bg-green-500/30 border-green-400 shadow-green-400/50";
                      } else if (isSelected) {
                        cardStyle =
                          "bg-red-500/30 border-red-400 shadow-red-400/50";
                      } else {
                        cardStyle = "bg-white/5 border-white/20 opacity-60";
                      }
                      isDisabled = true;
                    } else if (hasAnswered) {
                      // In playing phase, but player has answered
                      if (isSelected) {
                        cardStyle =
                          "bg-blue-500/20 border-blue-400 shadow-blue-400/50";
                      } else {
                        cardStyle = "bg-white/5 border-white/20 opacity-60";
                      }
                      isDisabled = true;
                    } else {
                      // In playing phase, player hasn't answered
                      cardStyle =
                        "bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 cursor-pointer";
                      isDisabled = false;
                    }

                    return (
                      <div
                        key={idx}
                        className={`relative group transition-all duration-300 ${
                          isSelected ? "transform scale-105" : ""
                        }`}
                      >
                        <Card
                          onClick={() => !isDisabled && handleAnswer(option)}
                          className={`transition-all duration-300 ${cardStyle} shadow-xl hover:shadow-2xl ${
                            !isDisabled ? "hover:scale-105" : ""
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-semibold text-white group-hover:text-purple-200">
                                {option}
                              </span>
                              <div className="flex items-center space-x-2">
                                {isSelected && (
                                  <CheckCircle className="w-6 h-6 text-blue-400" />
                                )}
                                {isRevealPhase && isCorrect && (
                                  <CheckCircle className="w-6 h-6 text-green-400" />
                                )}
                                {isRevealPhase && isSelected && !isCorrect && (
                                  <XCircle className="w-6 h-6 text-red-400" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>

                {/* Status Messages */}
                {isPlayingPhase && hasAnswered && (
                  <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-200">
                      <Clock className="w-4 h-4" />
                      <span>Waiting for other players to answer...</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-100">
                      {totalAnswered} of {players?.length || 0} players have
                      answered
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanation and Controls - Show in reveal phase */}
            {isRevealPhase && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <span className="font-semibold text-lg">
                        Correct Answer:
                      </span>
                      <span className="text-green-300 font-medium">
                        {currentQ.answer}
                      </span>
                    </div>

                    {currentQ.explanation && (
                      <div className="bg-blue-500/10 border border-blue-400/30 p-6 rounded-lg">
                        <p className="text-blue-100 leading-relaxed">
                          {currentQ.explanation}
                        </p>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-purple-200 text-sm">
                        Next question in {mpState.revealTimeRemaining ?? 0}{" "}
                        seconds...
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Scores */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Live Scores</h3>
                </div>
                <div className="space-y-3">
                  {players?.map((p: any) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        p.id === resolvedPlayerId
                          ? "bg-blue-500/20 border border-blue-400/30"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.color || "#3b82f6" }}
                        ></div>
                        <span
                          className={
                            p.id === resolvedPlayerId
                              ? "font-bold text-blue-200"
                              : "text-white"
                          }
                        >
                          {p.name}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          p.id === resolvedPlayerId
                            ? "text-blue-200"
                            : "text-white"
                        }`}
                      >
                        {p.id && mpState.scores?.[p.id]
                          ? mpState.scores[p.id]
                          : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Game Stats</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Questions:</span>
                    <span className="text-white">
                      {mpState.questionIndex + 1} / {mpState.questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Players:</span>
                    <span className="text-white">{players?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Answered:</span>
                    <span className="text-white">{totalAnswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Phase:</span>
                    <span className="text-white capitalize">
                      {mpState.phase}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
