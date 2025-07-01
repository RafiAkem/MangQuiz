import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer } from './Timer';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export function Question() {
  const { 
    questions, 
    currentQuestionIndex, 
    players, 
    selectedAnswers, 
    showAnswer, 
    submitAnswer,
    showQuestionAnswer,
    nextQuestion
  } = useTriviaGame();

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) return null;

  const allPlayersAnswered = players.every(player => 
    selectedAnswers[player.id] !== undefined
  );

  const handleAnswerSelect = (playerId: string, answerIndex: number) => {
    if (showAnswer) return;
    submitAnswer(playerId, answerIndex);
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const handleShowAnswer = () => {
    showQuestionAnswer();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="secondary">
                {currentQuestion.category}
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">
              {currentQuestion.question}
            </h2>
            
            <Timer type="question" />
          </div>
        </CardContent>
      </Card>

      {/* Answer Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md ${
              showAnswer 
                ? index === currentQuestion.correctAnswer
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : 'opacity-60'
                : 'hover:bg-gray-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option}</span>
                  {showAnswer && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                
                {/* Player Answers */}
                <div className="flex flex-wrap gap-2">
                  {players.map(player => {
                    const playerAnswer = selectedAnswers[player.id];
                    if (playerAnswer !== index) return null;
                    
                    const isCorrect = showAnswer && playerAnswer === currentQuestion.correctAnswer;
                    const isIncorrect = showAnswer && playerAnswer !== currentQuestion.correctAnswer;
                    
                    return (
                      <Badge
                        key={player.id}
                        variant={isCorrect ? "default" : isIncorrect ? "destructive" : "outline"}
                        className="text-xs"
                        style={{ 
                          backgroundColor: !showAnswer ? player.color : undefined,
                          color: !showAnswer ? 'white' : undefined 
                        }}
                      >
                        {player.name}
                        {showAnswer && (
                          <>
                            {isCorrect && <CheckCircle className="h-3 w-3 ml-1" />}
                            {isIncorrect && <XCircle className="h-3 w-3 ml-1" />}
                          </>
                        )}
                      </Badge>
                    );
                  })}
                </div>
                
                {/* Player Selection Buttons */}
                {!showAnswer && (
                  <div className="flex flex-wrap gap-2">
                    {players.map(player => {
                      const hasAnswered = selectedAnswers[player.id] !== undefined;
                      const selectedThis = selectedAnswers[player.id] === index;
                      
                      return (
                        <Button
                          key={player.id}
                          variant={selectedThis ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAnswerSelect(player.id, index)}
                          disabled={hasAnswered}
                          style={{
                            backgroundColor: selectedThis ? player.color : undefined,
                            borderColor: player.color,
                            color: selectedThis ? 'white' : player.color
                          }}
                        >
                          {player.name}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Explanation and Controls */}
      {showAnswer && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Correct Answer:</span>
                <span>{currentQuestion.options[currentQuestion.correctAnswer]}</span>
              </div>
              
              {currentQuestion.explanation && (
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                  {currentQuestion.explanation}
                </p>
              )}
              
              <div className="flex justify-center">
                <Button onClick={handleNextQuestion} size="lg">
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show Answer Button */}
      {!showAnswer && (allPlayersAnswered || players.length === 0) && (
        <div className="text-center">
          <Button onClick={handleShowAnswer} variant="outline">
            Show Answer
          </Button>
        </div>
      )}
    </div>
  );
}
