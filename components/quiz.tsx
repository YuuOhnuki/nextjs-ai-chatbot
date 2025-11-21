"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { QuizTemplate, QuizQuestion } from "@/lib/ai/tools/create-quiz";

interface QuizProps {
  quiz: QuizTemplate;
  onComplete?: (score: number, results: QuizResult[]) => void;
  isReadonly?: boolean;
}

interface QuizResult {
  questionId: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

export function Quiz({ quiz, onComplete, isReadonly = false }: QuizProps) {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, showResults]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isReadonly || showResults) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const results: QuizResult[] = quiz.questions.map((question, index) => ({
      questionId: question.id,
      question: question.question,
      userAnswer: selectedAnswers[index] ?? -1,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedAnswers[index] === question.correctAnswer,
      explanation: question.explanation
    }));

    const correctCount = results.filter(result => result.isCorrect).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);

    setQuizResults(results);
    setShowResults(true);
    onComplete?.(score, results);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreMessage = (score: number) => {
    if (score >= (quiz.passingScore || 70)) {
      return { text: t("quizPassed"), color: "text-green-600" };
    } else {
      return { text: t("quizFailed"), color: "text-red-600" };
    }
  };

  if (showResults) {
    const correctCount = quizResults.filter(result => result.isCorrect).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const scoreMessage = getScoreMessage(score);

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className={`w-16 h-16 ${score >= (quiz.passingScore || 70) ? "text-yellow-500" : "text-gray-400"}`} />
          </div>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <p className={`text-lg font-semibold ${scoreMessage.color}`}>{scoreMessage.text}</p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>{correctCount}/{quiz.questions.length} {t("correct")}</span>
            <span>{score}% {t("score")}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizResults.map((result, index) => (
            <motion.div
              key={result.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 ${result.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-2">{result.question}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        {t("yourAnswer")}: {result.userAnswer >= 0 ? quiz.questions.find(q => q.id === result.questionId)?.options[result.userAnswer] : t("notAnswered")}
                      </p>
                      {!result.isCorrect && (
                        <p className="text-green-600">
                          {t("correctAnswer")}: {quiz.questions.find(q => q.id === result.questionId)?.options[result.correctAnswer]}
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-muted-foreground mt-2 italic">{result.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {!isReadonly && (
            <div className="flex justify-center pt-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("retakeQuiz")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {t(quiz.difficulty)}
            </Badge>
            {timeRemaining !== null && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          {t("question")} {currentQuestionIndex + 1} {t("of")} {quiz.questions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isReadonly}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || isReadonly}
          >
            {t("previous")}
          </Button>
          
          <div className="flex gap-2">
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === null || isReadonly}
              >
                {t("next")}
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={selectedAnswers.some(answer => answer === null) || isReadonly}
              >
                {t("submitQuiz")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
