import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  Settings,
  MessageCircle,
  Crown,
  CheckCircle,
  Circle,
  Play,
  Plus,
  Search,
  Lock,
  Copy,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Sparkles,
  XCircle,
  Info,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useWebSocket } from "../../lib/contexts/WebSocketContext";
import {
  GeminiService,
  GeminiQuestionRequest,
} from "../../lib/services/geminiService";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
}

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  isPrivate: boolean;
  settings: {
    difficulty: string;
    category: string;
    questionCount: number;
  };
  createdAt: string;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

export function MultiplayerLobby() {
  const navigate = useNavigate();
  const { wsRef, isConnected } = useWebSocket();

  // State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // UI State
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");

  // Form states
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [roomSettings, setRoomSettings] = useState({
    difficulty: "medium",
    category: "all",
    questionCount: 10,
  });

  // AI Question Generation State
  const [aiCategory, setAiCategory] = useState("General History");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiCustomTopic, setAiCustomTopic] = useState("");
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Room settings state
  const [roomMaxPlayers, setRoomMaxPlayers] = useState(4);

  // Initialize WebSocket message handler
  useEffect(() => {
    if (!wsRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    wsRef.current.addEventListener("message", handleMessage);

    // Fetch rooms when connected
    if (isConnected) {
      fetchRooms();
    }

    return () => {
      wsRef.current?.removeEventListener("message", handleMessage);
    };
  }, [isConnected, wsRef]);

  const handleWebSocketMessage = (data: any) => {
    console.log("WebSocket message received:", data);

    switch (data.type) {
      case "room_joined":
        console.log("Room joined:", data);
        setCurrentRoom(data.room);
        setPlayers(data.players);
        setRoomMaxPlayers(data.room.maxPlayers);
        setCurrentPlayer(
          data.players.find((p: Player) => p.id === data.playerId) || null
        );
        setIsHost(
          data.players.find((p: Player) => p.id === data.playerId)?.isHost ||
            false
        );
        // Store the unique playerId in localStorage for robust identification
        if (data.playerId) {
          localStorage.setItem("quizRushPlayerId", data.playerId);
        }
        toast.success(`Successfully joined ${data.room.name}`);
        break;

      case "player_joined":
        console.log("Player joined:", data);
        setPlayers((prev) => [...prev, data.player]);
        setCurrentRoom(data.room);
        toast.info(`${data.player.name} joined the room`);
        break;

      case "player_left":
        console.log("Player left:", data);
        setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
        setCurrentRoom(data.room);
        if (data.newHostId === currentPlayer?.id) {
          setIsHost(true);
          toast.info("You are now the host");
        }
        break;

      case "player_ready_changed":
        console.log("Player ready changed:", data);
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === data.playerId ? { ...p, isReady: data.isReady } : p
          )
        );
        break;

      case "all_players_ready":
        console.log("All players ready:", data);
        setAllPlayersReady(data.canStart);
        if (data.canStart && isHost) {
          toast.success("All players are ready! You can now start the game.");
        }
        break;

      case "game_starting":
        console.log("Game starting:", data);
        setCountdown(data.countdown);
        toast.info(`Game will start in ${data.countdown} seconds`);
        break;

      case "countdown":
        console.log("Countdown:", data);
        setCountdown(data.countdown);
        break;

      case "game_started":
        console.log("Game started:", data);
        console.log("Current player before navigation:", currentPlayer);
        console.log("Players data:", data.players);
        setCountdown(null);

        // Make sure we have the current player
        if (!currentPlayer) {
          console.error("No current player found!");
          const myPlayer = data.players.find(
            (p: Player) => p.name === playerName
          );
          console.log("Found player by name:", myPlayer);
          if (myPlayer) {
            setCurrentPlayer(myPlayer);
          }
        }

        // Navigate to game with multiplayer settings
        const navigationState = {
          isMultiplayer: true,
          settings: data.settings,
          players: data.players,
          roomId: currentRoom?.id,
          playerId: localStorage.getItem("quizRushPlayerId"),
        };
        console.log("Navigation state:", navigationState);

        navigate("/multiplayer-game", {
          state: navigationState,
        });
        break;

      case "chat_message":
        console.log("Chat message:", data);
        setChatMessages((prev) => [...prev, data]);
        break;

      case "settings_updated":
        console.log("Settings updated:", data);
        if (data.settings) {
          setRoomSettings(data.settings);
        }
        if (data.maxPlayers !== undefined) {
          setRoomMaxPlayers(data.maxPlayers);
          setCurrentRoom((prev: any) =>
            prev ? { ...prev, maxPlayers: data.maxPlayers } : null
          );
        }
        toast.success("Room settings updated");
        break;

      case "error":
        console.log("Error:", data);
        toast.error(data.message);
        break;

      default:
        console.log("Unknown message type:", data.type);
        break;
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Store player name in localStorage for the game component to use
    localStorage.setItem("quizRushPlayerName", playerName);

    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          hostName: playerName,
          isPrivate,
          password: isPrivate ? roomPassword : undefined,
          maxPlayers: maxPlayers,
          settings: roomSettings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Join the room via WebSocket
        wsRef.current?.send(
          JSON.stringify({
            type: "join_room",
            roomId: data.roomId,
            playerName: playerName,
            password: isPrivate ? roomPassword : undefined,
          })
        );

        setCurrentPlayer({
          id: data.hostId,
          name: playerName,
          isHost: true,
          isReady: false,
          score: 0,
        });

        setShowCreateRoom(false);
        setRoomName("");
        setPlayerName("");
        setRoomPassword("");
        setIsPrivate(false);
        setMaxPlayers(4);
      } else {
        toast.error(data.error || "Failed to create room");
      }
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (room: Room, password?: string) => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Store player name in localStorage for the game component to use
    localStorage.setItem("quizRushPlayerName", playerName);

    wsRef.current?.send(
      JSON.stringify({
        type: "join_room",
        roomId: room.id,
        playerName: playerName,
        password: password,
      })
    );

    setSelectedRoom(room);
    setShowJoinRoom(false);
  };

  const leaveRoom = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "leave_room",
      })
    );

    setCurrentRoom(null);
    setPlayers([]);
    setCurrentPlayer(null);
    setIsHost(false);
    setAllPlayersReady(false);
    setCountdown(null);
    setChatMessages([]);
  };

  const toggleReady = () => {
    if (!currentPlayer) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "player_ready",
        ready: !currentPlayer.isReady,
      })
    );
  };

  const startGame = () => {
    if (aiQuestions && aiQuestions.length > 0) {
      wsRef.current?.send(
        JSON.stringify({
          type: "start_game",
          questions: aiQuestions,
        })
      );
    } else {
      wsRef.current?.send(
        JSON.stringify({
          type: "start_game",
        })
      );
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat_message",
        message: newMessage.trim(),
      })
    );

    setNewMessage("");
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      toast.success("Room code copied to clipboard");
    }
  };

  const updateSettings = (newSettings: any) => {
    if (!isHost) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "update_settings",
        settings: newSettings,
      })
    );
  };

  const updateMaxPlayers = (newMaxPlayers: number) => {
    if (!isHost) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "update_settings",
        maxPlayers: newMaxPlayers,
      })
    );
  };

  // AI Question Generation Handler
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    setAiSuccess(false);
    try {
      const request: GeminiQuestionRequest = {
        category: aiCategory,
        difficulty: aiDifficulty,
        count: aiQuestionCount,
        topic: aiCustomTopic.trim() || undefined,
      };
      const questions = await GeminiService.generateQuestions(request);
      setAiQuestions(questions);
      setAiSuccess(true);
    } catch (error) {
      setAiError(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
      setAiQuestions([]);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={leaveRoom}
                className="bg-white/10 text-white border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {currentRoom.name}
                </h1>
                <p className="text-blue-200 text-sm">
                  Room Code: {currentRoom.id}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomCode}
                    className="ml-2 text-blue-300 hover:text-blue-100"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-white text-sm">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Players List */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Players ({players.length}/{roomMaxPlayers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {player.isHost && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-white font-medium">
                          {player.name}
                        </span>
                        {player.id === currentPlayer?.id && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {player.isReady ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Question Generation (All Players See, Only Host Can Edit) */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                    AI-Generated Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
                        Category
                      </label>
                      <Select
                        value={aiCategory}
                        onValueChange={isHost ? setAiCategory : undefined}
                        disabled={!isHost}
                      >
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ancient History">
                            🏛️ Ancient History
                          </SelectItem>
                          <SelectItem value="Medieval History">
                            ⚔️ Medieval History
                          </SelectItem>
                          <SelectItem value="Modern History">
                            🏭 Modern History
                          </SelectItem>
                          <SelectItem value="World Wars">
                            🌍 World Wars
                          </SelectItem>
                          <SelectItem value="American History">
                            🇺🇸 American History
                          </SelectItem>
                          <SelectItem value="European History">
                            🇪🇺 European History
                          </SelectItem>
                          <SelectItem value="Asian History">
                            🌏 Asian History
                          </SelectItem>
                          <SelectItem value="General History">
                            📚 General History
                          </SelectItem>
                          <SelectItem value="Science">🔬 Science</SelectItem>
                          <SelectItem value="Geography">
                            🌍 Geography
                          </SelectItem>
                          <SelectItem value="Literature">
                            📖 Literature
                          </SelectItem>
                          <SelectItem value="Sports">⚽ Sports</SelectItem>
                          <SelectItem value="Entertainment">
                            🎬 Entertainment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
                        Difficulty
                      </label>
                      <Select
                        value={aiDifficulty}
                        onValueChange={
                          isHost
                            ? (value: "easy" | "medium" | "hard") =>
                                setAiDifficulty(value)
                            : undefined
                        }
                        disabled={!isHost}
                      >
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">🟢 Easy</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="hard">🔴 Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
                        Number of Questions
                      </label>
                      <Select
                        value={aiQuestionCount.toString()}
                        onValueChange={
                          isHost
                            ? (value) => setAiQuestionCount(parseInt(value))
                            : undefined
                        }
                        disabled={!isHost}
                      >
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                          <SelectItem value="25">25 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
                        Custom Topic (Optional)
                      </label>
                      <Input
                        placeholder="e.g., Ancient Rome, World War II, etc."
                        value={aiCustomTopic}
                        onChange={
                          isHost
                            ? (e) => setAiCustomTopic(e.target.value)
                            : undefined
                        }
                        className="bg-white/10 border-white/30 text-white placeholder-white/60"
                        disabled={!isHost}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={isHost ? handleGenerateAIQuestions : undefined}
                    disabled={!isHost || isGeneratingAI}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Questions with AI
                      </>
                    )}
                  </Button>
                  {aiError && (
                    <div className="flex items-center text-red-400 mt-2">
                      <XCircle className="w-4 h-4 mr-2" />
                      {aiError}
                    </div>
                  )}
                  {aiSuccess && (
                    <div className="flex items-center text-green-400 mt-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      AI questions generated and ready!
                    </div>
                  )}
                  {aiQuestions.length > 0 && (
                    <div className="mt-2 text-blue-200 text-xs">
                      {aiQuestions.length} questions generated. These will be
                      used when the game starts.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Room Settings (Host Only) */}
              {isHost && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-400" />
                      Room Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
                        Max Players
                      </label>
                      <Select
                        value={roomMaxPlayers.toString()}
                        onValueChange={(value) =>
                          updateMaxPlayers(parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Players</SelectItem>
                          <SelectItem value="3">3 Players</SelectItem>
                          <SelectItem value="4">4 Players</SelectItem>
                          <SelectItem value="6">6 Players</SelectItem>
                          <SelectItem value="8">8 Players</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-blue-300 text-xs mt-1">
                        Current: {players.length} players
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chat */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 overflow-y-auto space-y-2">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-blue-300 font-medium">
                          {msg.playerName}:
                        </span>
                        <span className="text-white ml-2">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="bg-white/10 border-white/30 text-white placeholder-white/60"
                    />
                    <Button onClick={sendMessage} size="sm">
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              onClick={toggleReady}
              className={`${
                currentPlayer?.isReady
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {currentPlayer?.isReady ? "Not Ready" : "Ready"}
            </Button>

            {isHost && (
              <Button
                onClick={startGame}
                disabled={!allPlayersReady || players.length < 2}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            )}
          </div>

          {/* Countdown */}
          {countdown !== null && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Game Starting</h2>
                <div className="text-6xl font-bold text-purple-600">
                  {countdown}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/mode")}
            className="bg-white/10 text-white border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mode Select
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-white">Multiplayer Lobby</h1>
          </div>
          <p className="text-blue-200">
            Join or create a room to play with friends online
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-white">
              {isConnected ? "Connected to server" : "Connecting..."}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Available Rooms */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Available Rooms</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchRooms}
                  className="text-white hover:text-blue-300"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <p className="text-blue-200 text-center py-8">
                    No rooms available
                  </p>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium">
                            {room.name}
                          </h3>
                          {room.isPrivate && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-600 text-white text-xs"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-blue-200 text-sm">
                          Host: {room.hostName} • {room.playerCount}/
                          {room.maxPlayers} players
                        </p>
                        <p className="text-blue-300 text-xs">
                          {room.settings.difficulty} • {room.settings.category}{" "}
                          • {room.settings.questionCount} questions
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowJoinRoom(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Room */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Create New Room</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm">Room Name</label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name"
                    className="bg-white/10 border-white/30 text-white placeholder-white/60"
                  />
                </div>
                <div>
                  <label className="text-white text-sm">Your Name</label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-white/10 border-white/30 text-white placeholder-white/60"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="private" className="text-white text-sm">
                    Private Room
                  </label>
                </div>
                {isPrivate && (
                  <div>
                    <label className="text-white text-sm">Password</label>
                    <Input
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      placeholder="Enter password"
                      type="password"
                      className="bg-white/10 border-white/30 text-white placeholder-white/60"
                    />
                  </div>
                )}
                <div>
                  <label className="text-white text-sm">Max Players</label>
                  <Select
                    value={maxPlayers.toString()}
                    onValueChange={(value) => setMaxPlayers(parseInt(value))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="6">6 Players</SelectItem>
                      <SelectItem value="8">8 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={createRoom}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!roomName.trim() || !playerName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/mode")}
            className="bg-white/10 text-white border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mode Select
          </Button>
        </div>

        {/* Join Room Dialog */}
        <Dialog
          open={showJoinRoom}
          onOpenChange={(open) => {
            setShowJoinRoom(open);
            if (!open) {
              setJoinPassword("");
            }
          }}
        >
          <DialogContent className="bg-white/95">
            <DialogHeader>
              <DialogTitle>Join Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              {selectedRoom && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{selectedRoom.name}</h3>
                    {selectedRoom.isPrivate && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-600 text-white text-xs"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Host: {selectedRoom.hostName} • {selectedRoom.playerCount}/
                    {selectedRoom.maxPlayers} players
                  </p>
                </div>
              )}
              {selectedRoom?.isPrivate && (
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Enter room password"
                    type="password"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinRoom(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedRoom &&
                    joinRoom(
                      selectedRoom,
                      selectedRoom.isPrivate ? joinPassword : undefined
                    )
                  }
                  disabled={
                    !playerName.trim() ||
                    (selectedRoom?.isPrivate && !joinPassword.trim())
                  }
                >
                  Join Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
