import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Computer Science", "English"];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "text/csv"];

const formSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  hourlyRate: z
    .number()
    .min(100, "Hourly rate must be at least ₹100")
    .max(5000, "Hourly rate cannot exceed ₹5000"),
  gradeFile: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 5MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only JPG, PNG, and CSV files are accepted"
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface MentorApplicationFormProps {
  onSuccess: () => void;
}

export const MentorApplicationForm = ({ onSuccess }: MentorApplicationFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      hourlyRate: 500,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("gradeFile", file);
      form.clearErrors("gradeFile");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setUploading(true);
      setUploadProgress(10);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to apply as a mentor");
        return;
      }

      // Check if user already has a mentor application
      const { data: existingMentor } = await supabase
        .from("mentors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingMentor) {
        toast.error("You have already submitted a mentor application");
        return;
      }

      setUploadProgress(30);

      // Upload grade document to storage
      const fileExt = values.gradeFile.name.split(".").pop();
      const fileName = `${user.id}/grade-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("grades")
        .upload(filePath, values.gradeFile);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(60);

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("grades").getPublicUrl(filePath);

      setUploadProgress(80);

      // Create mentor record with pending status
      const { error: insertError } = await supabase.from("mentors").insert({
        user_id: user.id,
        subject: values.subject,
        hourly_rate: values.hourlyRate,
        grade: publicUrl,
        status: "pending",
      });

      if (insertError) {
        throw insertError;
      }

      setUploadProgress(100);

      toast.success("Application submitted successfully! Please proceed to the verification test.");
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Become a Verified Mentor</CardTitle>
        <CardDescription>
          Share your knowledge and help fellow students. Complete this application to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your expertise subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the subject you want to mentor students in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Set your hourly rate between ₹100 and ₹5000
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gradeFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Grade Transcript</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.csv"
                          onChange={handleFileChange}
                          disabled={uploading}
                          {...field}
                        />
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>{selectedFile.name}</span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload your grade transcript (JPG, PNG, or CSV, max 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
