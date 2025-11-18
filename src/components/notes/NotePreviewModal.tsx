import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, ShoppingCart, Sparkles, MessageSquare, ClipboardList } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { FlashcardGenerator } from "./FlashcardGenerator";
import { FlashcardStudyDialog } from "./FlashcardStudyDialog";
import { PDFChatSidebar } from "./PDFChatSidebar";
import { QuizFlow } from "./QuizFlow";
import { Flashcard } from "@/services/ai";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Note = Tables<"notes"> & {
  profiles?: {
    full_name: string | null;
  } | null;
};

interface NotePreviewModalProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (noteId: string) => void;
}

export function NotePreviewModal({
  note,
  open,
  onOpenChange,
  onPurchase,
}: NotePreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [showStudyDialog, setShowStudyDialog] = useState(false);

  // Get the public URL for the PDF
  const pdfUrl = useMemo(() => {
    if (!note?.file_path) return null;
    const { data } = supabase.storage.from("notes").getPublicUrl(note.file_path);
    return data.publicUrl;
  }, [note?.file_path]);

  if (!note) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setLoadError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    console.error("PDF URL:", pdfUrl);
    console.error("File path:", note?.file_path);
    setLoading(false);
    setLoadError("Unable to load PDF preview. The file may not exist or the storage bucket may not be configured correctly.");
  };

  const isFree = note.price === 0 || note.price === null;
  const displayPrice = isFree ? "Free" : `₹${note.price}`;

  const handleFlashcardsGenerated = (flashcards: Flashcard[]) => {
    setGeneratedFlashcards(flashcards);
  };

  const handleStartStudy = () => {
    if (generatedFlashcards.length > 0) {
      setShowStudyDialog(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{note.title}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="flashcards">
                <Sparkles className="w-4 h-4 mr-2" />
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="quiz">
                <ClipboardList className="w-4 h-4 mr-2" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-6">
          {/* Metadata Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {note.subject}
              </Badge>
              <span className="text-2xl font-bold text-accent">
                {displayPrice}
              </span>
            </div>

            {note.description && (
              <p className="text-muted-foreground">{note.description}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Uploaded by{" "}
                <span className="font-medium text-foreground">
                  {note.profiles?.full_name || "Anonymous"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {note.downloads || 0} downloads
              </p>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* PDF Preview Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">
              Preview (First 3 Pages)
            </h3>

            {loading && !loadError && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <span className="ml-2 text-muted-foreground">
                  Loading preview...
                </span>
              </div>
            )}

            {loadError && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-destructive mb-2">{loadError}</p>
                <p className="text-sm text-muted-foreground">
                  Please ensure the storage bucket is public and the file exists.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  See DEBUG_PDF_ISSUE.md for troubleshooting steps.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                {[1, 2, 3].map((pageNumber) => (
                  pageNumber <= numPages && (
                    <div key={pageNumber} className="border rounded mb-4">
                      <Page
                        pageNumber={pageNumber}
                        width={Math.min(window.innerWidth * 0.6, 700)}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </div>
                  )
                ))}
              </Document>
            </div>

            {numPages > 3 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Showing 3 of {numPages} pages. Purchase to view the full document.
              </p>
            )}
          </div>

              {/* Purchase Button */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => onPurchase(note.id)}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isFree ? (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Free
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase for {displayPrice}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-4">
              <FlashcardGenerator
                noteId={note.id}
                noteTitle={note.title}
                onSuccess={handleFlashcardsGenerated}
              />

              {generatedFlashcards.length > 0 && (
                <Button
                  onClick={handleStartStudy}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Studying ({generatedFlashcards.length} cards)
                </Button>
              )}
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              <QuizFlow
                noteId={note.id}
                noteTitle={note.title}
                subject={note.subject}
              />
            </TabsContent>

            <TabsContent value="chat" className="h-[600px]">
              <PDFChatSidebar
                noteId={note.id}
                noteTitle={note.title}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <FlashcardStudyDialog
        flashcards={generatedFlashcards}
        open={showStudyDialog}
        onOpenChange={setShowStudyDialog}
        noteTitle={note.title}
      />
    </>
  );
}
