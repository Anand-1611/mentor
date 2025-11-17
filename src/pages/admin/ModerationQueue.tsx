import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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

interface FlaggedContent {
  flag_id: string;
  content_type: string;
  content_id: string;
  content_title: string;
  content_owner_id: string;
  content_owner_name: string;
  reason: string;
  description: string;
  reporter_id: string;
  reporter_name: string;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

/**
 * Moderation queue page for reviewing flagged content
 */
const ModerationQueue = () => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_flagged_content");

      if (error) throw error;

      setFlaggedContent(data || []);
    } catch (error: any) {
      console.error("Error fetching flagged content:", error);
      toast({
        title: "Error loading flagged content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFlag = async (
    flagId: string,
    status: "approved" | "rejected",
    action?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("review_flag", {
        flag_id: flagId,
        admin_id: user.id,
        new_status: status,
        action: action || null,
      });

      if (error) throw error;

      toast({
        title: "Flag reviewed",
        description: `Content has been ${status}`,
      });

      // Refresh the list
      fetchFlaggedContent();
      setActionDialogOpen(false);
      setSelectedFlag(null);
    } catch (error: any) {
      console.error("Error reviewing flag:", error);
      toast({
        title: "Error reviewing flag",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openActionDialog = (flag: FlaggedContent, type: "approve" | "reject") => {
    setSelectedFlag(flag);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const getActionForContentType = (contentType: string): string => {
    switch (contentType) {
      case "note":
        return "delete_note";
      case "post":
        return "delete_post";
      case "mentor":
        return "suspend_mentor";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case "note":
        return <Badge variant="secondary">Note</Badge>;
      case "post":
        return <Badge variant="secondary">Post</Badge>;
      case "mentor":
        return <Badge variant="secondary">Mentor</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingFlags = flaggedContent.filter((f) => f.status === "pending");
  const reviewedFlags = flaggedContent.filter((f) => f.status !== "pending");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Moderation Queue</h1>
        <Button onClick={fetchFlaggedContent} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Flags</CardTitle>
            <Flag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingFlags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedContent.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reviewedFlags.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Flags Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingFlags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending flags to review
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFlags.map((flag) => (
                  <TableRow key={flag.flag_id}>
                    <TableCell>{getContentTypeBadge(flag.content_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{flag.content_title}</TableCell>
                    <TableCell>{flag.content_owner_name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{flag.reason}</p>
                        {flag.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {flag.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{flag.reporter_name}</TableCell>
                    <TableCell>
                      {new Date(flag.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openActionDialog(flag, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve & Act
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(flag, "reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
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

      {/* Reviewed Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewed Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedFlags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reviewed flags yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedFlags.map((flag) => (
                  <TableRow key={flag.flag_id}>
                    <TableCell>{getContentTypeBadge(flag.content_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{flag.content_title}</TableCell>
                    <TableCell>{flag.reason}</TableCell>
                    <TableCell>{getStatusBadge(flag.status)}</TableCell>
                    <TableCell>
                      {flag.reviewed_at
                        ? new Date(flag.reviewed_at).toLocaleDateString()
                        : "N/A"}
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
              {actionType === "approve" ? "Approve Flag & Take Action" : "Reject Flag"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" ? (
                <>
                  This will mark the flag as approved and{" "}
                  {selectedFlag?.content_type === "note" && "delete the note"}
                  {selectedFlag?.content_type === "post" && "delete the post"}
                  {selectedFlag?.content_type === "mentor" && "suspend the mentor"}
                  . This action cannot be undone.
                </>
              ) : (
                "This will mark the flag as rejected and no action will be taken on the content."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedFlag) {
                  handleReviewFlag(
                    selectedFlag.flag_id,
                    actionType === "approve" ? "approved" : "rejected",
                    actionType === "approve"
                      ? getActionForContentType(selectedFlag.content_type)
                      : undefined
                  );
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

export default ModerationQueue;
