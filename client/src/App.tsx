import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { GameLobby } from "./components/game/GameLobby";
import { LocalTriviaGame } from "./components/game/LocalTriviaGame";
import { MultiplayerLobby } from "./components/game/MultiplayerLobby";
import { CustomQuestionsSetup } from "./components/game/CustomQuestionsSetup";
import { useTriviaGame } from "./lib/stores/useTriviaGame";
import { useAudio } from "./lib/stores/useAudio";
import { Button } from "./components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { IntroScreen } from "./components/game/IntroScreen";
import { Toaster } from "./components/ui/sonner";
import { MultiplayerTriviaGame } from "./components/game/MultiplayerTriviaGame";
import { WebSocketProvider } from "./lib/contexts/WebSocketContext";

function ModeSelect() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-6">Select Game Mode</h2>
        <div className="flex flex-col gap-4 w-64">
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 text-lg shadow-lg"
            onClick={() => navigate("/mode/local")}
          >
            Local (Party) Mode
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 text-lg shadow-lg"
            onClick={() => navigate("/mode/multiplayer")}
          >
            Online Multiplayer
          </Button>
        </div>
        <p className="mt-6 text-white/60 text-sm text-center">
          Local mode: 2-4 players on one device, no login required.
          <br />
          Multiplayer: Play online with friends in real-time.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const {
    isMuted,
    toggleMute,
    setBackgroundMusic,
    setHitSound,
    setSuccessSound,
  } = useAudio();
  const location = useLocation();

  // Audio setup
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const bgMusic = new Audio("/sounds/background.mp3");
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        setBackgroundMusic(bgMusic);
        const hitSound = new Audio("/sounds/hit.mp3");
        hitSound.volume = 0.5;
        setHitSound(hitSound);
        const successSound = new Audio("/sounds/success.mp3");
        successSound.volume = 0.6;
        setSuccessSound(successSound);
      } catch (error) {
        console.log("Audio initialization failed:", error);
      }
    };
    initializeAudio();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div className="relative min-h-screen">
      {/* Audio Control */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="bg-white shadow-lg"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-gray-600" />
          ) : (
            <Volume2 className="h-4 w-4 text-blue-600" />
          )}
        </Button>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <IntroScreen onComplete={() => window.location.replace("/mode")} />
          }
        />
        <Route path="/mode" element={<ModeSelect />} />
        <Route path="/mode/local" element={<GameLobby />} />
        <Route path="/mode/multiplayer" element={<MultiplayerLobby />} />
        <Route path="/game" element={<LocalTriviaGame />} />
        <Route
          path="/multiplayer-game"
          element={
            <MultiplayerTriviaGame
              playerId={location.state?.playerId}
              players={location.state?.players}
            />
          }
        />
        <Route path="/custom-questions" element={<CustomQuestionsSetup />} />
        {/* You can add more routes for results, etc. */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <AppContent />
      </Router>
    </WebSocketProvider>
  );
}

export default App;
