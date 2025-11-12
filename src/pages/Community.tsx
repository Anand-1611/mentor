import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newPost, setNewPost] = useState({ subject: "", content: "" });
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to post",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.subject || !newPost.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        subject: newPost.subject,
        content: newPost.content,
      });

      if (error) throw error;

      toast({
        title: "Posted successfully!",
      });
      setNewPost({ subject: "", content: "" });
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow students and share knowledge
          </p>
        </div>

        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create a Post</CardTitle>
              <CardDescription>Share your thoughts with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, Physics, Computer Science"
                    value={newPost.subject}
                    onChange={(e) => setNewPost({ ...newPost, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your question, insight, or resource..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-muted-foreground">Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.subject}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <CardTitle className="text-lg">
                    {post.profiles?.full_name || "Anonymous"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
