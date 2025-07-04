import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

// Types for multiplayer lobby
interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  ws: any;
}

// Add game state to GameRoom
type GamePhase = "waiting" | "starting" | "playing" | "final";
interface GameState {
  questions: { question: string; options: string[]; answer: string }[];
  questionIndex: number;
  answers: Record<string, string>; // playerId -> answer
  scores: Record<string, number>;
  phase: GamePhase;
}

interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: GamePhase;
  settings: {
    difficulty: string;
    category: string;
    questionCount: number;
  };
  createdAt: Date;
  gameState?: GameState;
}

// In-memory storage for rooms (in production, use Redis or database)
const rooms = new Map<string, GameRoom>();
const playerToRoom = new Map<string, string>();

// Simple static question generator (replace with LLM later)
function generateQuestions(
  count: number
): { question: string; options: string[]; answer: string }[] {
  const sample = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Rome", "Madrid"],
      answer: "Paris",
    },
    {
      question: "Who wrote Hamlet?",
      options: ["Shakespeare", "Tolstoy", "Hemingway", "Dickens"],
      answer: "Shakespeare",
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "What is the largest planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "Jupiter",
    },
    {
      question: "What is the boiling point of water?",
      options: ["90°C", "100°C", "110°C", "120°C"],
      answer: "100°C",
    },
  ];
  // Repeat and shuffle for demo
  let questions = [];
  for (let i = 0; i < count; i++) {
    const q = sample[i % sample.length];
    // Shuffle options
    const opts = [...q.options].sort(() => Math.random() - 0.5);
    questions.push({ ...q, options: opts });
  }
  return questions;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time multiplayer - use a specific path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/multiplayer", // Specific path for multiplayer WebSocket
  });

  // API routes for room management
  app.get("/api/rooms", (req, res) => {
    const publicRooms = Array.from(rooms.values())
      .filter((room) => !room.isPrivate && room.status === "waiting")
      .map((room) => ({
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        hostName:
          room.players.find((p) => p.id === room.hostId)?.name || "Unknown",
        settings: room.settings,
        createdAt: room.createdAt,
      }));

    res.json({ rooms: publicRooms });
  });

  app.post("/api/rooms", (req, res) => {
    const { name, hostName, isPrivate, password, settings } = req.body;

    if (!name || !hostName) {
      return res
        .status(400)
        .json({ error: "Room name and host name are required" });
    }

    const roomId = uuidv4();
    const hostId = uuidv4();

    const room: GameRoom = {
      id: roomId,
      name,
      hostId,
      players: [],
      maxPlayers: 4,
      isPrivate: isPrivate || false,
      password,
      status: "waiting",
      settings: {
        difficulty: settings?.difficulty || "medium",
        category: settings?.category || "all",
        questionCount: settings?.questionCount || 10,
      },
      createdAt: new Date(),
    };

    rooms.set(roomId, room);

    res.json({
      roomId,
      hostId,
      room: {
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
      },
    });
  });

  app.get("/api/rooms/:roomId", (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      id: room.id,
      name: room.name,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      isPrivate: room.isPrivate,
      status: room.status,
      settings: room.settings,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score,
      })),
    });
  });

  // WebSocket connection handling
  wss.on("connection", (ws) => {
    console.log("Multiplayer WebSocket client connected");
    let currentPlayer: Player | null = null;
    let currentRoom: GameRoom | null = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "join_room":
            handleJoinRoom(ws, data, currentPlayer, currentRoom);
            break;
          case "leave_room":
            handleLeaveRoom(ws, currentPlayer, currentRoom);
            break;
          case "player_ready":
            handlePlayerReady(ws, data, currentPlayer, currentRoom);
            break;
          case "start_game":
            handleStartGame(ws, currentPlayer, currentRoom);
            break;
          case "chat_message":
            handleChatMessage(ws, data, currentPlayer, currentRoom);
            break;
          case "update_settings":
            handleUpdateSettings(ws, data, currentPlayer, currentRoom);
            break;
          case "answer":
            handlePlayerAnswer(ws, data, currentPlayer, currentRoom);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    ws.on("close", () => {
      console.log("Multiplayer WebSocket client disconnected");
      if (currentPlayer && currentRoom) {
        handleLeaveRoom(ws, currentPlayer, currentRoom);
      }
    });

    function handleJoinRoom(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      const { roomId, playerName, password } = data;
      const targetRoom = rooms.get(roomId);

      if (!targetRoom) {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        return;
      }

      if (targetRoom.isPrivate && targetRoom.password !== password) {
        ws.send(
          JSON.stringify({ type: "error", message: "Incorrect password" })
        );
        return;
      }

      if (targetRoom.players.length >= targetRoom.maxPlayers) {
        ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
        return;
      }

      if (targetRoom.status !== "waiting") {
        ws.send(
          JSON.stringify({ type: "error", message: "Game already in progress" })
        );
        return;
      }

      // Create new player
      const newPlayer: Player = {
        id: uuidv4(),
        name: playerName,
        isHost: targetRoom.players.length === 0,
        isReady: false,
        score: 0,
        ws,
      };

      // Update room
      targetRoom.players.push(newPlayer);
      if (targetRoom.players.length === 1) {
        targetRoom.hostId = newPlayer.id;
      }

      // Update references
      currentPlayer = newPlayer;
      currentRoom = targetRoom;
      playerToRoom.set(newPlayer.id, roomId);

      // Notify all players in room
      broadcastToRoom(targetRoom, {
        type: "player_joined",
        player: {
          id: newPlayer.id,
          name: newPlayer.name,
          isHost: newPlayer.isHost,
          isReady: newPlayer.isReady,
          score: newPlayer.score,
        },
        room: {
          id: targetRoom.id,
          name: targetRoom.name,
          playerCount: targetRoom.players.length,
          maxPlayers: targetRoom.maxPlayers,
          settings: targetRoom.settings,
        },
      });

      // Send confirmation to joining player
      ws.send(
        JSON.stringify({
          type: "room_joined",
          room: {
            id: targetRoom.id,
            name: targetRoom.name,
            playerCount: targetRoom.players.length,
            maxPlayers: targetRoom.maxPlayers,
            settings: targetRoom.settings,
          },
          players: targetRoom.players.map((p) => ({
            id: p.id,
            name: p.name,
            isHost: p.isHost,
            isReady: p.isReady,
            score: p.score,
          })),
        })
      );
    }

    function handleLeaveRoom(
      ws: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      if (!player || !room) return;

      const playerIndex = room.players.findIndex((p) => p.id === player.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        playerToRoom.delete(player.id);

        // If host left, assign new host
        if (player.isHost && room.players.length > 0) {
          room.players[0].isHost = true;
          room.hostId = room.players[0].id;
        }

        // If room is empty, delete it
        if (room.players.length === 0) {
          rooms.delete(room.id);
        } else {
          // Notify remaining players
          broadcastToRoom(room, {
            type: "player_left",
            playerId: player.id,
            newHostId: room.hostId,
            room: {
              id: room.id,
              name: room.name,
              playerCount: room.players.length,
              maxPlayers: room.maxPlayers,
              settings: room.settings,
            },
          });
        }
      }

      currentPlayer = null;
      currentRoom = null;
    }

    function handlePlayerReady(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      if (!player || !room) return;

      player.isReady = data.ready;

      broadcastToRoom(room, {
        type: "player_ready_changed",
        playerId: player.id,
        isReady: player.isReady,
      });

      // Check if all players are ready
      const allReady =
        room.players.length >= 2 && room.players.every((p) => p.isReady);
      if (allReady) {
        broadcastToRoom(room, {
          type: "all_players_ready",
          canStart: true,
        });
      }
    }

    function handleStartGame(
      ws: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      if (!player || !room) return;
      if (!player.isHost) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Only host can start the game",
          })
        );
        return;
      }
      if (room.players.length < 2) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Need at least 2 players to start",
          })
        );
        return;
      }
      if (!room.players.every((p) => p.isReady)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "All players must be ready",
          })
        );
        return;
      }
      room.status = "playing";
      // Generate questions
      const questions = generateQuestions(room.settings.questionCount);
      // Initialize game state
      room.gameState = {
        questions,
        questionIndex: 0,
        answers: {},
        scores: Object.fromEntries(room.players.map((p) => [p.id, 0])),
        phase: "playing",
      };
      broadcastGameState(room);
    }

    function handleChatMessage(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      if (!player || !room) return;

      broadcastToRoom(room, {
        type: "chat_message",
        playerId: player.id,
        playerName: player.name,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    }

    function handleUpdateSettings(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      if (!player || !room) return;

      if (!player.isHost) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Only host can update settings",
          })
        );
        return;
      }

      if (room.status !== "waiting") {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Cannot update settings during game",
          })
        );
        return;
      }

      room.settings = { ...room.settings, ...data.settings };

      broadcastToRoom(room, {
        type: "settings_updated",
        settings: room.settings,
      });
    }

    function handlePlayerAnswer(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoom | null
    ) {
      if (!player || !room || !room.gameState) return;
      const { answer, playerId } = data;
      // Only accept answer if not already answered
      if (room.gameState.answers[playerId]) return;
      room.gameState.answers[playerId] = answer;
      // If all players have answered, score and move to next question
      if (Object.keys(room.gameState.answers).length === room.players.length) {
        scoreAndNext(room);
      } else {
        broadcastGameState(room);
      }
    }

    function scoreAndNext(room: GameRoom) {
      const gs = room.gameState!;
      const currentQ = gs.questions[gs.questionIndex];
      // Score answers
      for (const pid in gs.answers) {
        if (gs.answers[pid] === currentQ.answer) {
          gs.scores[pid] = (gs.scores[pid] || 0) + 1;
        }
      }
      // Next question or end
      if (gs.questionIndex + 1 < gs.questions.length) {
        gs.questionIndex++;
        gs.answers = {};
        broadcastGameState(room);
      } else {
        gs.phase = "final";
        broadcastGameState(room);
        broadcastToRoom(room, { type: "game_end" });
      }
    }

    function broadcastGameState(room: GameRoom) {
      broadcastToRoom(room, {
        type: "game_state",
        state: room.gameState,
      });
    }
  });

  function broadcastToRoom(room: GameRoom, message: any) {
    room.players.forEach((player) => {
      if (player.ws.readyState === 1) {
        // WebSocket.OPEN
        player.ws.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
