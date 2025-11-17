import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";
import { Flashcard } from "@/services/ai";

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  onComplete?: () => void;
}

interface FlashcardMastery {
  [key: number]: "easy" | "medium" | "hard" | null;
}

export function FlashcardStudy({ flashcards, onComplete }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastery, setMastery] = useState<FlashcardMastery>({});
  const [showResults, setShowResults] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const masteredCount = Object.values(mastery).filter(
    (m) => m === "easy" || m === "medium"
  ).length;

  useEffect(() => {
    // Reset flip state when changing cards
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMastery = (level: "easy" | "medium" | "hard") => {
    setMastery((prev) => ({
      ...prev,
      [currentIndex]: level,
    }));

    // Move to next card or show results
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
        if (onComplete) {
          onComplete();
        }
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setMastery({});
    setShowResults(false);
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No flashcards available</p>
      </div>
    );
  }

  if (showResults) {
    const easyCount = Object.values(mastery).filter((m) => m === "easy").length;
    const mediumCount = Object.values(mastery).filter((m) => m === "medium").length;
    const hardCount = Object.values(mastery).filter((m) => m === "hard").length;

    return (
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">Study Session Complete!</h3>
          <p className="text-muted-foreground">
            You've reviewed all {flashcards.length} flashcards
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {easyCount}
            </div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mediumCount}
            </div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="p-4 bg-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {hardCount}
            </div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Mastery Rate: {Math.round((masteredCount / flashcards.length) * 100)}%
          </p>
          <Progress value={(masteredCount / flashcards.length) * 100} />
        </div>

        <Button onClick={handleRestart} className="bg-accent hover:bg-accent/90">
          <RotateCw className="w-4 h-4 mr-2" />
          Study Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-muted-foreground">
            {masteredCount} mastered
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Flashcard */}
      <div className="relative h-[400px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <motion.div
              className="relative w-full h-full cursor-pointer"
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card (Question) */}
              <Card
                className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="space-y-4 text-center">
                  {currentCard.topic && (
                    <Badge variant="secondary">{currentCard.topic}</Badge>
                  )}
                  <p className="text-2xl font-semibold">{currentCard.question}</p>
                  <p className="text-sm text-muted-foreground">
                    Click to reveal answer
                  </p>
                </div>
              </Card>

              {/* Back of card (Answer) */}
              <Card
                className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="space-y-4 text-center">
                  {currentCard.topic && (
                    <Badge variant="secondary">{currentCard.topic}</Badge>
                  )}
                  <p className="text-xl text-muted-foreground mb-4">
                    {currentCard.question}
                  </p>
                  <p className="text-2xl font-semibold">{currentCard.answer}</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation and Mastery Buttons */}
      <div className="space-y-4">
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            <Button
              onClick={() => handleMastery("hard")}
              variant="outline"
              className="border-red-500/50 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              Hard
            </Button>
            <Button
              onClick={() => handleMastery("medium")}
              variant="outline"
              className="border-yellow-500/50 hover:bg-yellow-500/10"
            >
              <Brain className="w-4 h-4 mr-2 text-yellow-500" />
              Medium
            </Button>
            <Button
              onClick={() => handleMastery("easy")}
              variant="outline"
              className="border-green-500/50 hover:bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Easy
            </Button>
          </motion.div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleFlip} variant="outline">
            <RotateCw className="w-4 h-4 mr-2" />
            Flip Card
          </Button>
          <Button
            onClick={handleNext}
            variant="outline"
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
