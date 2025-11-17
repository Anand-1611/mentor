import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { generateFlashcards, Flashcard } from "@/services/ai";
import { toast } from "sonner";

interface FlashcardGeneratorProps {
  noteId: string;
  noteTitle: string;
  onSuccess?: (flashcards: Flashcard[]) => void;
}

export function FlashcardGenerator({
  noteId,
  noteTitle,
  onSuccess,
}: FlashcardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await generateFlashcards({
        note_id: noteId,
        max_flashcards: 50,
      });

      clearInterval(progressInterval);
      setProgress(100);

      setFlashcards(response.flashcards);
      toast.success(`Generated ${response.count} flashcards!`);
      
      if (onSuccess) {
        onSuccess(response.flashcards);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
      toast.error("Failed to generate flashcards");
      console.error("Flashcard generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Flashcard Generator
        </CardTitle>
        <CardDescription>
          Generate study flashcards from "{noteTitle}" using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isGenerating && flashcards.length === 0 && (
          <Button
            onClick={handleGenerate}
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Flashcards
          </Button>
        )}

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing PDF and generating flashcards...
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {flashcards.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Successfully generated {flashcards.length} flashcards
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {flashcards.slice(0, 5).map((card, index) => (
                <Card key={index} className="p-3">
                  <div className="space-y-2">
                    {card.topic && (
                      <Badge variant="outline" className="text-xs">
                        {card.topic}
                      </Badge>
                    )}
                    <p className="text-sm font-medium">{card.question}</p>
                    <p className="text-xs text-muted-foreground">{card.answer}</p>
                  </div>
                </Card>
              ))}
            </div>

            {flashcards.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing 5 of {flashcards.length} flashcards
              </p>
            )}

            <Button
              onClick={handleGenerate}
              variant="outline"
              className="w-full"
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Flashcards
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
