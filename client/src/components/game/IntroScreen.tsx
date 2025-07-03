import { useState, useEffect } from "react";
import { Brain, Clock, Users, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Initial fade in
    const timer1 = setTimeout(() => setFadeIn(true), 100);
    // Show main content
    const timer2 = setTimeout(() => setShowContent(true), 800);
    // Show button
    const timer3 = setTimeout(() => setShowButton(true), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden transition-opacity duration-1000 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating subtle particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Brain className="w-20 h-20 text-purple-400 drop-shadow-2xl" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                MangQuiz
              </span>
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white/90 mb-8">
              Challenge
            </h2>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1000 delay-700 ${
              showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-xl md:text-2xl text-white/70 mb-12 font-light leading-relaxed">
              Test your knowledge through time.
              <br />
              <span className="text-purple-300">
                Challenge friends. Make history.
              </span>
            </p>
          </div>

          {/* Feature highlights */}
          <div
            className={`transition-all duration-1000 delay-900 ${
              showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-white/60 text-sm font-medium">
                  Quick 5-minute rounds
                </p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-white/60 text-sm font-medium">
                  Multiplayer battles
                </p>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <p className="text-white/60 text-sm font-medium">
                  Multiple eras
                </p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div
            className={`transition-all duration-1000 delay-1100 ${
              showButton
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              onClick={onComplete}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-6 px-12 text-lg rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 border-0"
            >
              <span className="flex items-center">
                Begin Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </span>
            </Button>

            <p className="mt-6 text-white/40 text-sm font-light">
              Click to enter the main menu
            </p>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
}
