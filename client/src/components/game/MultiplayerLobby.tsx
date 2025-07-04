import { useState, useEffect, useRef } from "react";
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
  const wsRef = useRef<WebSocket | null>(null);

  // State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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

  // Form states
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    difficulty: "medium",
    category: "all",
    questionCount: 10,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/multiplayer`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      fetchRooms();
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      setCurrentRoom(null);
      setPlayers([]);
      setCurrentPlayer(null);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Failed to connect to server");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "room_joined":
        setCurrentRoom(data.room);
        setPlayers(data.players);
        const myPlayer = data.players.find(
          (p: Player) => p.name === playerName
        );
        setCurrentPlayer(myPlayer || data.players[0]);
        setIsHost((myPlayer || data.players[0])?.isHost || false);
        toast.success(`Successfully joined ${data.room.name}`);
        break;

      case "player_joined":
        setPlayers((prev) => [...prev, data.player]);
        setCurrentRoom(data.room);
        toast.info(`${data.player.name} joined the room`);
        break;

      case "player_left":
        setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
        setCurrentRoom(data.room);
        if (data.newHostId === currentPlayer?.id) {
          setIsHost(true);
          toast.info("You are now the host");
        }
        break;

      case "player_ready_changed":
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === data.playerId ? { ...p, isReady: data.isReady } : p
          )
        );
        break;

      case "all_players_ready":
        setAllPlayersReady(data.canStart);
        if (data.canStart && isHost) {
          toast.success("All players are ready! You can now start the game.");
        }
        break;

      case "game_starting":
        setCountdown(data.countdown);
        toast.info(`Game will start in ${data.countdown} seconds`);
        break;

      case "countdown":
        setCountdown(data.countdown);
        break;

      case "game_started":
        setCountdown(null);
        // Navigate to game with multiplayer settings
        navigate("/multiplayer-game", {
          state: {
            isMultiplayer: true,
            settings: data.settings,
            players: players,
            roomId: currentRoom?.id,
            playerId: currentPlayer?.id,
          },
        });
        break;

      case "chat_message":
        setChatMessages((prev) => [...prev, data]);
        break;

      case "settings_updated":
        setCurrentRoom((prev: any) =>
          prev ? { ...prev, settings: data.settings } : null
        );
        toast.info("Game settings have been updated");
        break;

      case "error":
        toast.error(data.message);
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
    if (!isHost) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "start_game",
      })
    );
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
                  Players ({players.length}/{currentRoom.maxPlayers})
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

            {/* Game Settings */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Game Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Difficulty</label>
                    <Select
                      value={currentRoom.settings.difficulty}
                      onValueChange={(value) =>
                        updateSettings({ difficulty: value })
                      }
                      disabled={!isHost}
                    >
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
                    <label className="text-white text-sm">Category</label>
                    <Select
                      value={currentRoom.settings.category}
                      onValueChange={(value) =>
                        updateSettings({ category: value })
                      }
                      disabled={!isHost}
                    >
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="general">
                          General Knowledge
                        </SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white text-sm">Questions</label>
                    <Select
                      value={currentRoom.settings.questionCount.toString()}
                      onValueChange={(value) =>
                        updateSettings({ questionCount: parseInt(value) })
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        <h3 className="text-white font-medium">{room.name}</h3>
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

                <Button
                  onClick={() => setShowCreateRoom(true)}
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

        {/* Create Room Dialog */}
        <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
          <DialogContent className="bg-white/95">
            <DialogHeader>
              <DialogTitle>Create Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Game Settings</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-xs">Difficulty</label>
                    <Select
                      value={roomSettings.difficulty}
                      onValueChange={(value) =>
                        setRoomSettings((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }
                    >
                      <SelectTrigger>
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
                    <label className="text-xs">Category</label>
                    <Select
                      value={roomSettings.category}
                      onValueChange={(value) =>
                        setRoomSettings((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="general">
                          General Knowledge
                        </SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateRoom(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createRoom} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Room Dialog */}
        <Dialog open={showJoinRoom} onOpenChange={setShowJoinRoom}>
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
                  <h3 className="font-medium">{selectedRoom.name}</h3>
                  <p className="text-sm text-gray-600">
                    Host: {selectedRoom.hostName} • {selectedRoom.playerCount}/
                    {selectedRoom.maxPlayers} players
                  </p>
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
                  onClick={() => selectedRoom && joinRoom(selectedRoom)}
                  disabled={!playerName.trim()}
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
