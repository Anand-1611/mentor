import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadataStr = formData.get("metadata") as string;

    if (!file) {
      throw new Error("No file provided");
    }

    if (!metadataStr) {
      throw new Error("No metadata provided");
    }

    const metadata = JSON.parse(metadataStr);
    const { title, description, subject, price, tags } = metadata;

    // Validate file type and size
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are accepted");
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 50MB");
    }

    // Generate unique note ID
    const noteId = crypto.randomUUID();
    
    // Define storage paths
    const pdfPath = `notes/${user.id}/${noteId}/original.pdf`;
    const thumbnailPath = `thumbnails/${user.id}/${noteId}/thumbnail.png`;

    // Upload PDF to storage
    const pdfArrayBuffer = await file.arrayBuffer();
    const pdfBuffer = new Uint8Array(pdfArrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("notes")
      .upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get public URL for the PDF
    const { data: pdfUrlData } = supabase.storage
      .from("notes")
      .getPublicUrl(pdfPath);

    const fileUrl = pdfUrlData.publicUrl;

    // Generate thumbnail from first page
    // Note: For MVP, we'll use a placeholder. Full implementation would use pdf-lib or similar
    // to extract the first page and convert it to an image
    let thumbnailUrl = null;
    
    try {
      // Create a simple placeholder thumbnail
      // In production, you would use a library like pdf-lib to extract the first page
      // For now, we'll skip thumbnail generation and set it to null
      // The frontend can show a default PDF icon
      
      // Placeholder for future thumbnail generation:
      // const pdfDoc = await PDFDocument.load(pdfBuffer);
      // const firstPage = pdfDoc.getPage(0);
      // const thumbnail = await generateThumbnail(firstPage);
      // Upload thumbnail to storage
      
      console.log("Thumbnail generation skipped for MVP - using placeholder");
    } catch (thumbnailError) {
      console.error("Thumbnail generation error:", thumbnailError);
      // Continue without thumbnail - not critical for MVP
    }

    // Create notes table record
    const { data: noteData, error: insertError } = await supabase
      .from("notes")
      .insert({
        id: noteId,
        owner_id: user.id,
        title,
        description,
        subject,
        price: price || 0,
        tags: tags || [],
        file_path: pdfPath,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("notes").remove([pdfPath]);
      
      throw new Error(`Failed to create note record: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        noteId: noteData.id,
        fileUrl,
        thumbnailUrl,
        message: "Note uploaded successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in upload-note function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
