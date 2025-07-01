import { useEffect } from 'react';
import { GameLobby } from './components/game/GameLobby';
import { TriviaGame } from './components/game/TriviaGame';
import { useTriviaGame } from './lib/stores/useTriviaGame';
import { useAudio } from './lib/stores/useAudio';
import { Button } from './components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

function App() {
  const { phase } = useTriviaGame();
  const { 
    isMuted, 
    toggleMute, 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound 
  } = useAudio();

  // Initialize audio on component mount
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Initialize background music
        const bgMusic = new Audio('/sounds/background.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        setBackgroundMusic(bgMusic);

        // Initialize sound effects
        const hitSound = new Audio('/sounds/hit.mp3');
        hitSound.volume = 0.5;
        setHitSound(hitSound);

        const successSound = new Audio('/sounds/success.mp3');
        successSound.volume = 0.6;
        setSuccessSound(successSound);

        console.log('Audio initialized successfully');
      } catch (error) {
        console.log('Audio initialization failed:', error);
      }
    };

    initializeAudio();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  const renderCurrentPhase = () => {
    switch (phase) {
      case 'lobby':
        return <GameLobby />;
      case 'playing':
        return <TriviaGame />;
      case 'final':
        return <TriviaGame />; // GameResults is rendered within TriviaGame
      default:
        return <GameLobby />;
    }
  };

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

      {/* Main Game Content */}
      {renderCurrentPhase()}
    </div>
  );
}

export default App;
