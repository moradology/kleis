import type { APIRoute } from 'astro';

interface ContactSubmission {
  name: string;
  email: string;
  subject: string; // Kept subject as required based on ContactForm.tsx
  message: string;
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ success: false, message: "Invalid content type. Expected application/json." }), {
      status: 415, // Unsupported Media Type
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let data: ContactSubmission;
  try {
    data = await request.json() as ContactSubmission;
  } catch (error) {
    // Handle JSON parsing errors
    return new Response(JSON.stringify({ success: false, message: 'Invalid JSON payload.' }), {
      status: 400, // Bad Request
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Basic server-side validation
  const errors: Partial<Record<keyof ContactSubmission, string>> = {};
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.name = 'Name is required.';
  }
  if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email address format.';
  }
  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim() === '') {
    errors.subject = 'Subject is required.';
  }
  if (!data.message || typeof data.message !== 'string' || data.message.trim() === '') {
    errors.message = 'Message is required.';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ success: false, message: 'Validation failed.', errors }), {
      status: 400, // Bad Request
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- Critical Architectural Decision Point ---
  // In a real application, you would integrate with an email service (e.g., SendGrid, Resend),
  // save to a database, or trigger a notification system.
  // For this initial plan, we'll just log the data and simulate success.
  // --- End Decision Point ---

  console.log('Contact Form Submission Received:');
  console.log('Name:', data.name);
  console.log('Email:', data.email);
  console.log('Subject:', data.subject);
  console.log('Message:', data.message);

  // Simulate processing delay (e.g., sending an email)
  await new Promise(resolve => setTimeout(resolve, 1000));

  return new Response(JSON.stringify({ success: true, message: 'Your message has been received successfully! We will get back to you shortly.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  // Catch-all for unexpected errors during processing (after validation)
  // This part is less likely to be hit with the current simple logging,
  // but good practice for more complex logic.
  // try {
  //   // ... actual processing logic ...
  // } catch (error) {
  //   console.error('Error processing contact form submission:', error);
  //   return new Response(JSON.stringify({ success: false, message: 'An unexpected error occurred on the server. Please try again later.' }), {
  //     status: 500, // Internal Server Error
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }
};