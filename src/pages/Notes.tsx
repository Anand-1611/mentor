import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotesUploadDialog } from "@/components/notes/NotesUploadDialog";
import { NotePreviewModal } from "@/components/notes/NotePreviewModal";
import { NotesFiltersComponent, NotesFilters } from "@/components/notes/NotesFilters";
import { MockPaymentDialog } from "@/components/payment/MockPaymentDialog";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { purchaseNote, downloadFreeNote, processMockPayment } from "@/services/payment";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";

type Note = Tables<"notes"> & {
  profiles?: {
    full_name: string | null;
  } | null;
};

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mockPaymentOpen, setMockPaymentOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filters, setFilters] = useState<NotesFilters>({
    subjects: [],
    priceRange: [0, 5000],
    sortBy: "recent",
  });
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchNotes();
  }, [debouncedSearchTerm, filters]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let query;
      
      if (debouncedSearchTerm.trim()) {
        // Use full-text search when there's a search term
        query = supabase
          .rpc("search_notes", { search_query: debouncedSearchTerm });
      } else {
        // Fetch all notes when no search term
        query = supabase
          .from("notes")
          .select("*, profiles(full_name)");
      }

      // Apply subject filter
      if (filters.subjects.length > 0) {
        query = query.in("subject", filters.subjects);
      }

      // Apply price range filter
      query = query
        .gte("price", filters.priceRange[0])
        .lte("price", filters.priceRange[1]);

      // Apply sorting
      switch (filters.sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("downloads", { ascending: false });
          break;
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      subjects: [],
      priceRange: [0, 5000],
      sortBy: "recent",
    });
  };

  const handleUploadSuccess = (noteId: string) => {
    toast.success("Your notes have been uploaded successfully!", {
      description: "They are now available in the marketplace.",
      action: {
        label: "View",
        onClick: () => {
          // Scroll to the newly uploaded note
          const noteElement = document.getElementById(`note-${noteId}`);
          if (noteElement) {
            noteElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        },
      },
    });
    // Refresh the notes list
    fetchNotes();
  };

  const handleViewNote = (note: Note) => {
    setPreviewNote(note);
    setPreviewOpen(true);
  };

  const handlePurchase = async (noteId: string) => {
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) {
        toast.error("Note not found");
        return;
      }

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to purchase notes");
        return;
      }

      // Check if user is trying to buy their own note
      if (note.owner_id === session.user.id) {
        toast.error("You cannot purchase your own notes");
        return;
      }

      const isFree = note.price === 0 || note.price === null;

      if (isFree) {
        // Handle free download
        await downloadFreeNote(noteId);
        toast.success("Download started!", {
          description: "Your free note is being downloaded.",
        });
        setPreviewOpen(false);
      } else {
        // Try to use Stripe, fall back to mock payment
        try {
          toast.loading("Redirecting to payment...");
          await purchaseNote(noteId, note.price);
        } catch (error: any) {
          if (error.message === "MOCK_PAYMENT_REQUIRED") {
            // Use mock payment dialog
            setSelectedNote(note);
            setMockPaymentOpen(true);
            setPreviewOpen(false);
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error("Error purchasing note:", error);
      toast.error(error.message || "Failed to process purchase");
    }
  };

  const handleMockPaymentSuccess = async () => {
    if (!selectedNote) return;

    try {
      toast.loading("Processing payment...");
      await processMockPayment(selectedNote.id, selectedNote.price);
      toast.success("Payment successful!", {
        description: "Your note has been purchased. Redirecting...",
      });
      
      // Redirect to success page
      setTimeout(() => {
        navigate("/payment/success?session_id=mock_" + Date.now());
      }, 1500);
    } catch (error: any) {
      console.error("Error processing mock payment:", error);
      toast.error(error.message || "Failed to process payment");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Notes Marketplace</h1>
              <p className="text-muted-foreground mt-2">
                Browse and download notes from top students
              </p>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Notes
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search notes by title, subject, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <NotesFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Notes Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No notes found</p>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try a different search term or adjust filters" : "Be the first to upload notes!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <Card 
                    key={note.id} 
                    id={`note-${note.id}`}
                    className="hover:border-accent transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{note.subject}</Badge>
                        <span className="text-lg font-bold text-accent">
                          {note.price === 0 ? "Free" : `₹${note.price}`}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {note.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          By {note.profiles?.full_name || "Anonymous"}
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-accent hover:bg-accent/90"
                          onClick={() => handleViewNote(note)}
                        >
                          View
                        </Button>
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {note.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <NotesUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Preview Modal */}
      <NotePreviewModal
        note={previewNote}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onPurchase={handlePurchase}
      />

      {/* Mock Payment Dialog */}
      {selectedNote && (
        <MockPaymentDialog
          open={mockPaymentOpen}
          onOpenChange={setMockPaymentOpen}
          amount={selectedNote.price}
          noteTitle={selectedNote.title}
          onSuccess={handleMockPaymentSuccess}
        />
      )}
    </div>
  );
};

export default Notes;
