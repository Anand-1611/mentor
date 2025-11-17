import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const timeSchema = z.object({
  hours: z.number().min(0).max(23),
  minutes: z.number().min(0).max(59),
});

const availabilitySchema = z.object({
  isAvailable: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface DayAvailability {
  id?: string;
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AvailabilitySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to manage availability");
        return;
      }
      setUserId(user.id);

      // Load existing availability
      const { data, error } = await supabase
        .from("mentor_availability")
        .select("*")
        .eq("mentor_id", user.id)
        .order("day_of_week");

      if (error) throw error;

      // Initialize availability for all days
      const availabilityMap = new Map<number, DayAvailability>();
      
      // Set defaults for all days
      for (let i = 0; i < 7; i++) {
        availabilityMap.set(i, {
          dayOfWeek: i,
          isAvailable: false,
          startTime: "09:00",
          endTime: "17:00",
        });
      }

      // Override with existing data
      data?.forEach((item) => {
        availabilityMap.set(item.day_of_week, {
          id: item.id,
          dayOfWeek: item.day_of_week,
          isAvailable: item.is_available,
          startTime: item.start_time,
          endTime: item.end_time,
        });
      });

      setAvailability(Array.from(availabilityMap.values()));
    } catch (error: any) {
      console.error("Error loading availability:", error);
      toast.error("Failed to load availability settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayIndex
          ? { ...day, isAvailable: !day.isAvailable }
          : day
      )
    );
  };

  const handleTimeChange = (
    dayIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setSaving(true);

      // Delete all existing availability for this mentor
      await supabase
        .from("mentor_availability")
        .delete()
        .eq("mentor_id", userId);

      // Insert new availability records for enabled days
      const recordsToInsert = availability
        .filter((day) => day.isAvailable)
        .map((day) => ({
          mentor_id: userId,
          day_of_week: day.dayOfWeek,
          start_time: day.startTime,
          end_time: day.endTime,
          is_available: true,
        }));

      if (recordsToInsert.length > 0) {
        const { error } = await supabase
          .from("mentor_availability")
          .insert(recordsToInsert);

        if (error) throw error;
      }

      toast.success("Availability settings saved successfully");
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Settings</CardTitle>
        <CardDescription>
          Set your weekly availability for mentoring sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.map((day) => (
          <div
            key={day.dayOfWeek}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1">
              <Switch
                checked={day.isAvailable}
                onCheckedChange={() => handleToggleDay(day.dayOfWeek)}
              />
              <span className="font-medium w-24">
                {DAYS_OF_WEEK[day.dayOfWeek]}
              </span>
            </div>

            {day.isAvailable && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) =>
                    handleTimeChange(day.dayOfWeek, "startTime", e.target.value)
                  }
                  className="px-3 py-2 border rounded-md"
                />
                <span>to</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) =>
                    handleTimeChange(day.dayOfWeek, "endTime", e.target.value)
                  }
                  className="px-3 py-2 border rounded-md"
                />
              </div>
            )}
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Availability"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
