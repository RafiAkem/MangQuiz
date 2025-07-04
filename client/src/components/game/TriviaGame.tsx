import { useEffect, useRef, useState } from "react";
import { Question } from "./Question";
import { ScoreBoard } from "./ScoreBoard";
import { GameResults } from "./GameResults";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { useAudio } from "../../lib/stores/useAudio";

// Multiplayer props
interface MultiplayerProps {
  isMultiplayer?: boolean;
  wsRef?: React.MutableRefObject<WebSocket | null>;
  playerId?: string;
  players?: any[];
}

export function TriviaGame({
  isMultiplayer = false,
  wsRef,
  playerId,
  players,
}: MultiplayerProps) {
  const { phase } = useTriviaGame();
  const { playSuccess } = useAudio();

  // Multiplayer state
  const [mpState, setMpState] = useState<any>(null); // { questionIndex, questions, answers, scores, phase }
  const [mpAnswer, setMpAnswer] = useState<string | null>(null);

  // Listen for multiplayer game state updates
  useEffect(() => {
    if (!isMultiplayer || !wsRef?.current) return;
    const ws = wsRef.current;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "game_state") {
        setMpState(data.state);
      }
      if (data.type === "game_end") {
        setMpState((prev: any) => ({ ...prev, phase: "final" }));
      }
    };
    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [isMultiplayer, wsRef]);

  // Handle phase transitions for sound effects
  useEffect(() => {
    if (!isMultiplayer && phase === "final") {
      setTimeout(() => playSuccess(), 500);
    }
    if (isMultiplayer && mpState?.phase === "final") {
      setTimeout(() => playSuccess(), 500);
    }
  }, [phase, playSuccess, isMultiplayer, mpState]);

  // Send answer to server in multiplayer
  const handleAnswer = (answer: string) => {
    if (isMultiplayer && wsRef?.current && mpState && playerId) {
      setMpAnswer(answer);
      wsRef.current.send(
        JSON.stringify({
          type: "answer",
          answer,
          playerId,
        })
      );
    }
  };

  // Render multiplayer game
  if (isMultiplayer && mpState) {
    if (mpState.phase === "final") {
      return <GameResults />;
    }
    const currentQ = mpState.questions[mpState.questionIndex];
    const hasAnswered = playerId ? !!mpState.answers?.[playerId] : false;
    const totalAnswered = Object.keys(mpState.answers || {}).length;
    const waitingForOthers =
      hasAnswered && totalAnswered < (players?.length || 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white/10 rounded-xl p-6 mb-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentQ.question}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.options.map((option: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={hasAnswered || !playerId}
                      className={`bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg text-left transition-colors ${
                        playerId && mpState.answers?.[playerId] === option
                          ? "ring-2 ring-yellow-400"
                          : ""
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {hasAnswered && (
                  <div className="text-blue-200 mt-4">
                    Waiting for other players to answer...
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Scores</h3>
                <ul>
                  {players?.map((p) => (
                    <li
                      key={p.id}
                      className={
                        p.id === playerId
                          ? "font-bold text-yellow-300"
                          : "text-white"
                      }
                    >
                      {p.name}:{" "}
                      {p.id && mpState.scores[p.id] ? mpState.scores[p.id] : 0}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Local game
  if (phase === "final") {
    return <GameResults />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            <Question />
          </div>
          {/* Sidebar with Scoreboard */}
          <div className="space-y-6">
            <ScoreBoard />
            {/* Add round stats or other sidebar cards here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
