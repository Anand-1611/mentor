import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
}

export const Navbar = ({ user }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
    navigate("/");
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="w-6 h-6 text-accent" />
            <span>MentorLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/notes" className="text-foreground hover:text-accent transition-colors">
              Notes
            </Link>
            <Link to="/mentors" className="text-foreground hover:text-accent transition-colors">
              Mentors
            </Link>
            <Link to="/community" className="text-foreground hover:text-accent transition-colors">
              Community
            </Link>
            {user && (
              <Link to="/dashboard" className="text-foreground hover:text-accent transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="bg-accent hover:bg-accent/90">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/notes"
              className="block py-2 px-4 hover:bg-muted rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Notes
            </Link>
            <Link
              to="/mentors"
              className="block py-2 px-4 hover:bg-muted rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Mentors
            </Link>
            <Link
              to="/community"
              className="block py-2 px-4 hover:bg-muted rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Community
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="block py-2 px-4 hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Profile
                    </Button>
                  </Link>
                  <Button onClick={handleSignOut} variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-accent hover:bg-accent/90">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
