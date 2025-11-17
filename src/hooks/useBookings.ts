import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Booking {
  id: string;
  student_id: string;
  mentor_id: string;
  slot: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  meeting_url?: string;
  created_at: string;
}

export const useBookings = (userId?: string, role?: "student" | "mentor") => {
  return useQuery({
    queryKey: ["bookings", userId, role],
    queryFn: async () => {
      const column = role === "mentor" ? "mentor_id" : "student_id";
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq(column, userId)
        .order("slot", { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Omit<Booking, "id" | "created_at" | "status">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...booking, status: "pending" })
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    },
    onMutate: async (newBooking) => {
      // Cancel outgoing refetches for both student and mentor
      await queryClient.cancelQueries({
        queryKey: ["bookings", newBooking.student_id, "student"],
      });
      await queryClient.cancelQueries({
        queryKey: ["bookings", newBooking.mentor_id, "mentor"],
      });

      // Snapshot previous values
      const previousStudentBookings = queryClient.getQueryData<Booking[]>([
        "bookings",
        newBooking.student_id,
        "student",
      ]);
      const previousMentorBookings = queryClient.getQueryData<Booking[]>([
        "bookings",
        newBooking.mentor_id,
        "mentor",
      ]);

      // Optimistically update for student
      if (previousStudentBookings) {
        queryClient.setQueryData<Booking[]>(
          ["bookings", newBooking.student_id, "student"],
          [
            ...previousStudentBookings,
            {
              ...newBooking,
              id: "temp-" + Date.now(),
              status: "pending" as const,
              created_at: new Date().toISOString(),
            } as Booking,
          ]
        );
      }

      // Optimistically update for mentor
      if (previousMentorBookings) {
        queryClient.setQueryData<Booking[]>(
          ["bookings", newBooking.mentor_id, "mentor"],
          [
            ...previousMentorBookings,
            {
              ...newBooking,
              id: "temp-" + Date.now(),
              status: "pending" as const,
              created_at: new Date().toISOString(),
            } as Booking,
          ]
        );
      }

      return { previousStudentBookings, previousMentorBookings, newBooking };
    },
    onError: (err, newBooking, context) => {
      // Rollback on error
      if (context?.previousStudentBookings) {
        queryClient.setQueryData(
          ["bookings", context.newBooking.student_id, "student"],
          context.previousStudentBookings
        );
      }
      if (context?.previousMentorBookings) {
        queryClient.setQueryData(
          ["bookings", context.newBooking.mentor_id, "mentor"],
          context.previousMentorBookings
        );
      }
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
    },
    onSettled: (data, error, variables, context) => {
      // Refetch to ensure consistency
      if (context?.newBooking) {
        queryClient.invalidateQueries({
          queryKey: ["bookings", context.newBooking.student_id, "student"],
        });
        queryClient.invalidateQueries({
          queryKey: ["bookings", context.newBooking.mentor_id, "mentor"],
        });
      }
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Booking>;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    },
    onSuccess: (data) => {
      // Invalidate queries for both student and mentor
      queryClient.invalidateQueries({
        queryKey: ["bookings", data.student_id, "student"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings", data.mentor_id, "mentor"],
      });
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    },
  });
};
