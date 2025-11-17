import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ShoppingBag, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Purchase {
  id: string;
  amount: number;
  created_at: string;
  watermarked_file_path: string | null;
  note_id: string;
  notes: {
    title: string;
    subject: string;
    description: string | null;
    thumbnail_url: string | null;
  };
}

const MyPurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to view your purchases");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          created_at,
          watermarked_file_path,
          note_id,
          notes!inner(
            title,
            subject,
            description,
            thumbnail_url
          )
        `)
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setPurchases(data as Purchase[] || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchase: Purchase) => {
    try {
      setDownloadingId(purchase.id);

      // Check if watermarked file exists
      if (!purchase.watermarked_file_path) {
        toast.error("Watermarked file is being prepared. Please try again in a few moments.");
        return;
      }

      // Generate signed URL for download
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("notes")
        .createSignedUrl(purchase.watermarked_file_path, 60); // 1 minute expiration

      if (signedUrlError || !signedUrlData) {
        console.error("Error creating signed URL:", signedUrlError);
        toast.error("Failed to generate download link");
        return;
      }

      // Increment downloads counter
      await supabase.rpc("increment_note_downloads", {
        note_id: purchase.note_id,
      });

      // Download the file
      const response = await fetch(signedUrlData.signedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${purchase.notes.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your purchases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-accent" />
            My Purchases
          </h1>
          <p className="text-muted-foreground mt-2">
            Access all your purchased notes and download them anytime
          </p>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No purchases yet</p>
              <p className="text-muted-foreground mb-4">
                Browse the notes marketplace to find study materials
              </p>
              <Button
                onClick={() => window.location.href = "/notes"}
                className="bg-accent hover:bg-accent/90"
              >
                Browse Notes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All downloaded files are watermarked with your email and transaction ID for security purposes.
                Download links are valid for 7 days from purchase date.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="hover:border-accent transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{purchase.notes.subject}</Badge>
                      <span className="text-lg font-bold text-accent">
                        ₹{purchase.amount}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{purchase.notes.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {purchase.notes.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Purchased on {formatDate(purchase.created_at)}</span>
                      </div>

                      <Button
                        onClick={() => handleDownload(purchase)}
                        disabled={downloadingId === purchase.id || !purchase.watermarked_file_path}
                        className="w-full bg-accent hover:bg-accent/90"
                      >
                        {downloadingId === purchase.id ? (
                          <>
                            <Download className="w-4 h-4 mr-2 animate-pulse" />
                            Downloading...
                          </>
                        ) : !purchase.watermarked_file_path ? (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;
