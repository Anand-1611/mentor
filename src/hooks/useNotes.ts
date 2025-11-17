import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  subject: string;
  price: number;
  tags?: string[];
  file_url: string;
  thumbnail_url?: string;
  downloads: number;
  created_at: string;
}

export const useNotes = (filters?: {
  subject?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  return useQuery({
    queryKey: ["notes", filters],
    queryFn: async () => {
      let query = supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.subject) {
        query = query.eq("subject", filters.subject);
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Note[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNote = (noteId?: string) => {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      if (error) throw error;
      return data as Note;
    },
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIncrementDownloads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { data, error } = await supabase.rpc("increment_downloads", {
        note_id: noteId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, noteId) => {
      // Invalidate note queries to refetch updated download count
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
