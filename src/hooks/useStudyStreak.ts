import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to automatically update study streak when user performs activities
 * Call this hook in components where user activities occur:
 * - Note viewing
 * - Flashcard studying
 * - Quiz attempts
 */
export const useStudyStreak = () => {
  useEffect(() => {
    updateStreak();
  }, []);

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc("update_study_streak", {
        user_uuid: user.id,
      });
    } catch (error) {
      console.error("Error updating study streak:", error);
      // Silently fail - streak tracking shouldn't block user activities
    }
  };

  return { updateStreak };
};
