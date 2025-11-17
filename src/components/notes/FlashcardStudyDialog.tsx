import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlashcardStudy } from "./FlashcardStudy";
import { Flashcard } from "@/services/ai";

interface FlashcardStudyDialogProps {
  flashcards: Flashcard[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteTitle: string;
}

export function FlashcardStudyDialog({
  flashcards,
  open,
  onOpenChange,
  noteTitle,
}: FlashcardStudyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Study Flashcards: {noteTitle}</DialogTitle>
        </DialogHeader>
        <FlashcardStudy
          flashcards={flashcards}
          onComplete={() => {
            // Optional: handle completion
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
