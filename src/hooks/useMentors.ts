import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Mentor {
  id: string;
  user_id: string;
  subject: string;
  hourly_rate: number;
  status: "pending" | "verified" | "rejected";
  test_score?: number;
  verified_at?: string;
  created_at: string;
}

export const useMentors = (filters?: {
  subject?: string;
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ["mentors", filters],
    queryFn: async () => {
      let query = supabase
        .from("mentors")
        .select("*, profiles(*)")
        .order("test_score", { ascending: false, nullsFirst: false });

      if (filters?.verifiedOnly !== false) {
        query = query.eq("status", "verified");
      }

      if (filters?.subject) {
        query = query.eq("subject", filters.subject);
      }

      if (filters?.minRate !== undefined) {
        query = query.gte("hourly_rate", filters.minRate);
      }

      if (filters?.maxRate !== undefined) {
        query = query.lte("hourly_rate", filters.maxRate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMentor = (mentorId?: string) => {
  return useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*, profiles(*)")
        .eq("id", mentorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!mentorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecommendedMentors = (weakSubjects?: string[]) => {
  return useQuery({
    queryKey: ["recommended-mentors", weakSubjects],
    queryFn: async () => {
      if (!weakSubjects || weakSubjects.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("mentors")
        .select("*, profiles(*)")
        .eq("status", "verified")
        .in("subject", weakSubjects)
        .order("test_score", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!weakSubjects && weakSubjects.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
