import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface FlaggedNote {
  note_id: string;
  title: string;
  subject: string;
  owner_id: string;
  owner_name: string;
  plagiarism_score: number;
  plagiarism_checked_at: string;
  plagiarism_details: any;
  created_at: string;
  downloads: number;
}

/**
 * Content review page for plagiarism detection and note review
 */
const ContentReview = () => {
  const [flaggedNotes, setFlaggedNotes] = useState<FlaggedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<FlaggedNote | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "delete" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedNotes();
  }, []);

  const fetchFlaggedNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_notes_for_plagiarism_review");

      if (error) throw error;

      setFlaggedNotes(data || []);
    } catch (error: any) {
      console.error("Error fetching flagged notes:", error);
      toast({
        title: "Error loading flagged notes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFlag = async (noteId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("clear_plagiarism_flag", {
        note_uuid: noteId,
        admin_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Flag cleared",
        description: "The plagiarism flag has been removed from this note",
      });

      fetchFlaggedNotes();
      setActionDialogOpen(false);
      setSelectedNote(null);
    } catch (error: any) {
      console.error("Error clearing flag:", error);
      toast({
        title: "Error clearing flag",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast({
        title: "Note deleted",
        description: "The note has been permanently removed",
      });

      fetchFlaggedNotes();
      setActionDialogOpen(false);
      setSelectedNote(null);
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openActionDialog = (note: FlaggedNote, type: "approve" | "delete") => {
    setSelectedNote(note);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const getSeverityColor = (score: number) => {
    if (score >= 90) return "text-red-600";
    if (score >= 80) return "text-orange-600";
    return "text-yellow-600";
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 90) return <Badge variant="destructive">Critical</Badge>;
    if (score >= 80) return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Content Review</h1>
        <Button onClick={fetchFlaggedNotes} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Plagiarism Detection
          </CardTitle>
          <CardDescription>
            Notes with plagiarism scores above 70% are automatically flagged for review.
            Review each note and either approve it (clear the flag) or delete it if it violates policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Flagged</p>
              <p className="text-2xl font-bold">{flaggedNotes.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical (≥90%)</p>
              <p className="text-2xl font-bold text-red-600">
                {flaggedNotes.filter((n) => n.plagiarism_score >= 90).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High (80-89%)</p>
              <p className="text-2xl font-bold text-orange-600">
                {flaggedNotes.filter((n) => n.plagiarism_score >= 80 && n.plagiarism_score < 90).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Plagiarism Detection API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API Integration Status</p>
                <p className="text-sm text-muted-foreground">
                  Configure plagiarism detection API (Copyleaks, Turnitin, or similar)
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Not Configured
              </Badge>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Setup Instructions:</strong>
              </p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
                <li>Sign up for a plagiarism detection API service (e.g., Copyleaks)</li>
                <li>Add API credentials to environment variables</li>
                <li>Create a Supabase Edge Function to call the API when notes are uploaded</li>
                <li>Update the upload-note function to trigger plagiarism check</li>
                <li>Store results using the update_plagiarism_score function</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedNotes.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium">No flagged notes</p>
              <p className="text-muted-foreground">
                All notes are clear or plagiarism detection is not yet configured
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Checked</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedNotes.map((note) => (
                  <TableRow key={note.note_id}>
                    <TableCell className="max-w-xs">
                      <div>
                        <p className="font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{note.subject}</Badge>
                    </TableCell>
                    <TableCell>{note.owner_name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className={`font-bold ${getSeverityColor(note.plagiarism_score)}`}>
                          {note.plagiarism_score.toFixed(1)}%
                        </p>
                        <Progress 
                          value={note.plagiarism_score} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(note.plagiarism_score)}</TableCell>
                    <TableCell>
                      {note.plagiarism_checked_at
                        ? new Date(note.plagiarism_checked_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{note.downloads}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(note, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openActionDialog(note, "delete")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Note" : "Delete Note"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" ? (
                <>
                  This will clear the plagiarism flag and allow the note to remain on the platform.
                  The note "{selectedNote?.title}" will be marked as reviewed.
                </>
              ) : (
                <>
                  This will permanently delete the note "{selectedNote?.title}".
                  This action cannot be undone and the owner will lose access to this content.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedNote) {
                  if (actionType === "approve") {
                    handleClearFlag(selectedNote.note_id);
                  } else {
                    handleDeleteNote(selectedNote.note_id);
                  }
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentReview;
