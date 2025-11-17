import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

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

    const { transactionId } = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select(`
        *,
        notes!inner(file_path, owner_id, title),
        profiles!transactions_buyer_id_fkey(email, full_name)
      `)
      .eq("id", transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", transactionError);
      throw new Error("Transaction not found");
    }

    const note = transaction.notes;
    const buyer = transaction.profiles;

    if (!note || !buyer) {
      throw new Error("Invalid transaction data");
    }

    console.log(`Watermarking PDF for transaction ${transactionId}`);

    // Download the original PDF from storage
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from("notes")
      .download(note.file_path);

    if (downloadError || !pdfData) {
      console.error("Error downloading PDF:", downloadError);
      throw new Error("Failed to download PDF");
    }

    // Convert blob to array buffer
    const pdfBytes = await pdfData.arrayBuffer();

    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Watermark text
    const watermarkText = `Licensed to: ${buyer.email}\nTransaction ID: ${transactionId}\nPurchased: ${new Date().toLocaleDateString()}`;

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = 10;
      const textWidth = font.widthOfTextAtSize(watermarkText.split('\n')[0], fontSize);
      
      // Add watermark at bottom right corner
      page.drawText(watermarkText, {
        x: width - textWidth - 50,
        y: 30,
        size: fontSize,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.5,
      });

      // Add diagonal watermark in center
      const centerText = `Licensed to ${buyer.full_name || buyer.email}`;
      const centerTextWidth = font.widthOfTextAtSize(centerText, 20);
      
      page.drawText(centerText, {
        x: (width - centerTextWidth) / 2,
        y: height / 2,
        size: 20,
        font: font,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.3,
        rotate: { angle: 45, type: 'degrees' },
      });
    }

    // Save the watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();

    // Upload watermarked PDF to storage
    const watermarkedPath = `${note.file_path.replace('/original.pdf', '')}/watermarked/${transactionId}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from("notes")
      .upload(watermarkedPath, watermarkedPdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading watermarked PDF:", uploadError);
      throw new Error("Failed to upload watermarked PDF");
    }

    // Generate signed URL with 7-day expiration
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("notes")
      .createSignedUrl(watermarkedPath, 7 * 24 * 60 * 60); // 7 days in seconds

    if (signedUrlError || !signedUrlData) {
      console.error("Error creating signed URL:", signedUrlError);
      throw new Error("Failed to create download URL");
    }

    // Update transaction with watermarked file path
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        watermarked_file_path: watermarkedPath,
      })
      .eq("id", transactionId);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
    }

    console.log(`Watermarked PDF created: ${watermarkedPath}`);

    // Send download link email to buyer
    try {
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const dashboardUrl = `${Deno.env.get("FRONTEND_URL") || "http://localhost:5173"}/dashboard/purchases`;
      
      const emailResponse = await supabase.functions.invoke("send-email", {
        body: {
          template: "download-link",
          to: buyer.email,
          variables: {
            buyerName: buyer.full_name || "Student",
            noteTitle: note.title,
            subject: transaction.notes?.subject || "N/A",
            transactionId: transactionId,
            downloadUrl: signedUrlData.signedUrl,
            expiryDate: expiryDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            dashboardUrl: dashboardUrl,
            buyerEmail: buyer.email,
          },
        },
      });

      if (emailResponse.error) {
        console.error("Error sending download link email:", emailResponse.error);
        // Don't fail the watermarking if email fails
      } else {
        console.log("Download link email sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send download link email:", emailError);
      // Don't fail the watermarking if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: signedUrlData.signedUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Watermarking error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
