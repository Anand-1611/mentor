import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  PhoneOff,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface VideoCallInterfaceProps {
  meetingUrl: string;
  bookingId: string;
  userName: string;
}

export function VideoCallInterface({ 
  meetingUrl, 
  bookingId, 
  userName 
}: VideoCallInterfaceProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, []);

  const joinCall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Daily.co is available
      // @ts-ignore - Daily will be loaded from CDN or npm package
      if (typeof window.DailyIframe === "undefined") {
        // Load Daily.co from CDN if not already loaded
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@daily-co/daily-js";
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // @ts-ignore
      const DailyIframe = window.DailyIframe;

      if (!containerRef.current) {
        throw new Error("Container not ready");
      }

      // Create Daily call frame
      callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: {
          width: "100%",
          height: "600px",
          border: "0",
          borderRadius: "8px",
        },
      });

      // Set up event listeners
      callFrameRef.current
        .on("joined-meeting", () => {
          console.log("Joined meeting");
          setIsJoined(true);
          setIsLoading(false);
        })
        .on("left-meeting", () => {
          console.log("Left meeting");
          setIsJoined(false);
        })
        .on("error", (error: any) => {
          console.error("Daily error:", error);
          setError(error.errorMsg || "An error occurred");
          setIsLoading(false);
        });

      // Join the meeting
      await callFrameRef.current.join({
        url: meetingUrl,
        userName: userName,
      });

    } catch (err: any) {
      console.error("Error joining call:", err);
      setError(err.message || "Failed to join call");
      toast.error("Failed to join video call");
      setIsLoading(false);
    }
  };

  const leaveCall = async () => {
    try {
      if (callFrameRef.current) {
        await callFrameRef.current.leave();
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
      setIsJoined(false);
      toast.success("Left the call");
    } catch (err: any) {
      console.error("Error leaving call:", err);
      toast.error("Error leaving call");
    }
  };

  const toggleVideo = async () => {
    try {
      if (callFrameRef.current) {
        await callFrameRef.current.setLocalVideo(!isVideoOn);
        setIsVideoOn(!isVideoOn);
      }
    } catch (err) {
      console.error("Error toggling video:", err);
      toast.error("Failed to toggle video");
    }
  };

  const toggleAudio = async () => {
    try {
      if (callFrameRef.current) {
        await callFrameRef.current.setLocalAudio(!isAudioOn);
        setIsAudioOn(!isAudioOn);
      }
    } catch (err) {
      console.error("Error toggling audio:", err);
      toast.error("Failed to toggle audio");
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (callFrameRef.current) {
        if (isScreenSharing) {
          await callFrameRef.current.stopScreenShare();
        } else {
          await callFrameRef.current.startScreenShare();
        }
        setIsScreenSharing(!isScreenSharing);
      }
    } catch (err) {
      console.error("Error toggling screen share:", err);
      toast.error("Failed to toggle screen share");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Call</CardTitle>
        <CardDescription>
          Join your mentoring session
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isJoined ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground text-center">
              Ready to join your mentoring session?
            </p>
            <Button 
              onClick={joinCall} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Join Call
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="mb-4" />
            
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="icon"
                onClick={toggleVideo}
              >
                {isVideoOn ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant={isAudioOn ? "default" : "destructive"}
                size="icon"
                onClick={toggleAudio}
              >
                {isAudioOn ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="icon"
                onClick={toggleScreenShare}
              >
                {isScreenSharing ? (
                  <MonitorOff className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={leaveCall}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
