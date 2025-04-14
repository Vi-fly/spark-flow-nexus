
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entityType, data } = await req.json();
    
    console.log(`Validating ${entityType} data:`, data);
    
    // Validate task data
    if (entityType === 'task') {
      const { title, description, priority, status, deadline } = data;
      
      const issues = [];
      
      // Basic required field validation
      if (!title || title.trim() === '') issues.push('Title is required');
      if (!status) issues.push('Status is required');
      if (!priority) issues.push('Priority is required');
      
      // Title length validation
      if (title && title.length < 3) issues.push('Title should be at least 3 characters');
      if (title && title.length > 100) issues.push('Title should be at most 100 characters');
      
      // Description validation if provided
      if (description && description.length > 1000) issues.push('Description is too long (max 1000 chars)');
      
      // Deadline validation
      if (deadline) {
        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) issues.push('Invalid deadline date format');
        
        // Check if deadline is in the past
        const now = new Date();
        if (deadlineDate < now) issues.push('Deadline cannot be in the past');
      }
      
      // If there are issues, respond with errors
      if (issues.length > 0) {
        return new Response(JSON.stringify({ 
          valid: false, 
          message: "Task validation failed", 
          issues
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      // Data is valid
      return new Response(JSON.stringify({ 
        valid: true, 
        message: "Task data is valid" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Validate contact data
    else if (entityType === 'contact') {
      const { name, email, phone } = data;
      
      const issues = [];
      
      // Basic required field validation
      if (!name || name.trim() === '') issues.push('Name is required');
      
      // Name length validation
      if (name && name.length < 2) issues.push('Name should be at least 2 characters');
      if (name && name.length > 100) issues.push('Name should be at most 100 characters');
      
      // Email validation if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) issues.push('Invalid email format');
      }
      
      // Phone validation if provided
      if (phone && typeof phone === 'string') {
        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(phone)) issues.push('Invalid phone number format');
      }
      
      // If there are issues, respond with errors
      if (issues.length > 0) {
        return new Response(JSON.stringify({ 
          valid: false, 
          message: "Contact validation failed", 
          issues
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      // Data is valid
      return new Response(JSON.stringify({ 
        valid: true, 
        message: "Contact data is valid" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Unknown entity type
    return new Response(JSON.stringify({ 
      valid: false, 
      message: `Unknown entity type: ${entityType}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
    
  } catch (error) {
    console.error("Error in validation function:", error);
    
    return new Response(JSON.stringify({ 
      valid: false, 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
