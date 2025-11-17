import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  template: string;
  to: string;
  variables: Record<string, string>;
  subject?: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  htmlPath: string;
}

const templates: Record<string, EmailTemplate> = {
  "purchase-confirmation": {
    name: "purchase-confirmation",
    subject: "Purchase Confirmation - {{noteTitle}}",
    htmlPath: "./templates/purchase-confirmation.html",
  },
  "download-link": {
    name: "download-link",
    subject: "Your Download is Ready - {{noteTitle}}",
    htmlPath: "./templates/download-link.html",
  },
  "booking-confirmation-student": {
    name: "booking-confirmation-student",
    subject: "Session Booked with {{mentorName}}",
    htmlPath: "./templates/booking-confirmation-student.html",
  },
  "booking-confirmation-mentor": {
    name: "booking-confirmation-mentor",
    subject: "New Session Booking from {{studentName}}",
    htmlPath: "./templates/booking-confirmation-mentor.html",
  },
  "mentor-verification-success": {
    name: "mentor-verification-success",
    subject: "Congratulations! You're Now a Verified Mentor",
    htmlPath: "./templates/mentor-verification-success.html",
  },
  "mentor-verification-failure": {
    name: "mentor-verification-failure",
    subject: "Mentor Verification Test Results",
    htmlPath: "./templates/mentor-verification-failure.html",
  },
};

// Replace template variables with actual values
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

// Load HTML template from file
async function loadTemplate(templatePath: string): Promise<string> {
  try {
    const template = await Deno.readTextFile(templatePath);
    return template;
  } catch (error) {
    console.error(`Error loading template ${templatePath}:`, error);
    throw new Error(`Template not found: ${templatePath}`);
  }
}

// Send email using Resend API
async function sendEmailWithResend(
  to: string,
  subject: string,
  html: string,
  retryCount = 0
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@resend.dev";

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      
      // Retry on server errors (5xx) or rate limits (429)
      if ((response.status >= 500 || response.status === 429) && retryCount < maxRetries) {
        console.log(`Retrying email send (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return sendEmailWithResend(to, subject, html, retryCount + 1);
      }

      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      emailId: data.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Retry on network errors
    if (retryCount < maxRetries) {
      console.log(`Retrying email send (attempt ${retryCount + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return sendEmailWithResend(to, subject, html, retryCount + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Log email send to database
async function logEmail(
  supabase: any,
  recipient: string,
  templateName: string,
  subject: string,
  status: "sent" | "failed" | "pending",
  errorMessage?: string,
  emailId?: string,
  metadata?: Record<string, any>
) {
  try {
    const { error } = await supabase
      .from("email_logs")
      .insert({
        recipient_email: recipient,
        template_name: templateName,
        subject: subject,
        status: status,
        error_message: errorMessage,
        resend_email_id: emailId,
        metadata: metadata || {},
      });

    if (error) {
      console.error("Error logging email:", error);
    }
  } catch (error) {
    console.error("Failed to log email:", error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { template, to, variables, subject: customSubject }: EmailRequest = await req.json();

    // Validate input
    if (!template || !to || !variables) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: template, to, variables" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if template exists
    const templateConfig = templates[template];
    if (!templateConfig) {
      return new Response(
        JSON.stringify({ 
          error: `Template not found: ${template}`,
          availableTemplates: Object.keys(templates)
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load HTML template
    const htmlTemplate = await loadTemplate(templateConfig.htmlPath);

    // Replace variables in HTML
    const html = replaceVariables(htmlTemplate, variables);

    // Replace variables in subject or use custom subject
    const subject = customSubject || replaceVariables(templateConfig.subject, variables);

    // Log email as pending
    await logEmail(
      supabase,
      to,
      template,
      subject,
      "pending",
      undefined,
      undefined,
      { variables }
    );

    // Send email
    const result = await sendEmailWithResend(to, subject, html);

    if (result.success) {
      // Update log to sent
      await logEmail(
        supabase,
        to,
        template,
        subject,
        "sent",
        undefined,
        result.emailId,
        { variables }
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully",
          emailId: result.emailId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Update log to failed
      await logEmail(
        supabase,
        to,
        template,
        subject,
        "failed",
        result.error,
        undefined,
        { variables }
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
