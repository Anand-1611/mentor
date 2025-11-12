import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Notes = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Notes Marketplace</h1>
          <p className="text-muted-foreground mb-6">
            Browse and download notes from top students
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No notes found</p>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "Be the first to upload notes!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{note.subject}</Badge>
                    <span className="text-lg font-bold text-accent">
                      ₹{note.price || "Free"}
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
                    <Button size="sm" className="bg-accent hover:bg-accent/90">
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
  );
};

export default Notes;
