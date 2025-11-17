import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Flashcard {
  id: string;
  user_id: string;
  source_note_id?: string;
  question: string;
  answer: string;
  mastery_level: number;
  last_reviewed_at?: string;
  created_at: string;
}

export const useFlashcards = (userId?: string) => {
  return useQuery({
    queryKey: ["flashcards", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flashcard: Omit<Flashcard, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("flashcards")
        .insert(flashcard)
        .select()
        .single();

      if (error) throw error;
      return data as Flashcard;
    },
    onMutate: async (newFlashcard) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["flashcards", newFlashcard.user_id] });

      // Snapshot previous value
      const previousFlashcards = queryClient.getQueryData<Flashcard[]>([
        "flashcards",
        newFlashcard.user_id,
      ]);

      // Optimistically update
      if (previousFlashcards) {
        queryClient.setQueryData<Flashcard[]>(
          ["flashcards", newFlashcard.user_id],
          [
            {
              ...newFlashcard,
              id: "temp-" + Date.now(),
              created_at: new Date().toISOString(),
            } as Flashcard,
            ...previousFlashcards,
          ]
        );
      }

      return { previousFlashcards };
    },
    onError: (err, newFlashcard, context) => {
      // Rollback on error
      if (context?.previousFlashcards) {
        queryClient.setQueryData(
          ["flashcards", newFlashcard.user_id],
          context.previousFlashcards
        );
      }
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Flashcard created successfully",
      });
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["flashcards", variables.user_id] });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Flashcard>;
    }) => {
      const { data, error } = await supabase
        .from("flashcards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Flashcard;
    },
    onMutate: async ({ id, updates }) => {
      const userId = updates.user_id;
      await queryClient.cancelQueries({ queryKey: ["flashcards", userId] });

      const previousFlashcards = queryClient.getQueryData<Flashcard[]>([
        "flashcards",
        userId,
      ]);

      if (previousFlashcards) {
        queryClient.setQueryData<Flashcard[]>(
          ["flashcards", userId],
          previousFlashcards.map((fc) =>
            fc.id === id ? { ...fc, ...updates } : fc
          )
        );
      }

      return { previousFlashcards, userId };
    },
    onError: (err, variables, context) => {
      if (context?.previousFlashcards && context?.userId) {
        queryClient.setQueryData(
          ["flashcards", context.userId],
          context.previousFlashcards
        );
      }
    },
    onSettled: (data, error, variables, context) => {
      if (context?.userId) {
        queryClient.invalidateQueries({ queryKey: ["flashcards", context.userId] });
      }
    },
  });
};
