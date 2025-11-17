import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Send, MessageSquare, FileText } from "lucide-react";
import { chatWithPDF, indexPDF, ChatMessage } from "@/services/ai";
import { toast } from "sonner";

interface PDFChatSidebarProps {
  noteId: string;
  noteTitle: string;
  onPageNavigate?: (pageNumber: number) => void;
}

export function PDFChatSidebar({
  noteId,
  noteTitle,
  onPageNavigate,
}: PDFChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleIndexPDF = async () => {
    setIndexing(true);
    try {
      const response = await indexPDF({ note_id: noteId });
      if (response.success) {
        setIsIndexed(true);
        toast.success(`PDF indexed successfully! ${response.chunks_indexed} chunks processed.`);
      }
    } catch (error) {
      console.error("Error indexing PDF:", error);
      toast.error(error instanceof Error ? error.message : "Failed to index PDF");
    } finally {
      setIndexing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithPDF({
        note_id: noteId,
        question: userMessage.content,
        history: messages,
      });

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Store page references for navigation
      if (response.pages.length > 0) {
        // You could enhance this to show page badges in the message
        console.log("Referenced pages:", response.pages);
      }
    } catch (error) {
      console.error("Error chatting with PDF:", error);
      
      // Check if PDF needs to be indexed
      if (error instanceof Error && error.message.includes("index")) {
        toast.error("Please index the PDF first before chatting");
        setIsIndexed(false);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to get response");
      }
      
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Chat with PDF</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {noteTitle}
        </p>
      </div>

      {/* Index Button */}
      {!isIndexed && (
        <div className="p-4 border-b bg-muted/30">
          <Button
            onClick={handleIndexPDF}
            disabled={indexing}
            className="w-full"
            variant="outline"
          >
            {indexing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Indexing PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Index PDF for Chat
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Index the PDF once to enable AI-powered chat
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">
              {isIndexed
                ? "Ask questions about this PDF"
                : "Index the PDF to start chatting"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[85%] p-3 ${
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="max-w-[85%] p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isIndexed ? "Ask a question..." : "Index PDF first..."
            }
            disabled={!isIndexed || loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isIndexed || !input.trim() || loading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
