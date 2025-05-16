import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, productSlug, variantSku } = data;

    if (!email || (!productSlug && !variantSku)) {
      return new Response(JSON.stringify({ message: 'Email and product identifier (slug or SKU) are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: 'Invalid email format.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In a real application, you would save this to a database or send it to a mailing list service.
    // For this example, we'll just log it to the console.
    console.log(`Notify Me Request:
      Email: ${email}
      Product Slug: ${productSlug || 'N/A'}
      Variant SKU: ${variantSku || 'N/A'}
    `);

    return new Response(JSON.stringify({ success: true, message: 'You will be notified when the product is back in stock.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing notify-me request:', error);
    return new Response(JSON.stringify({ success: false, message: 'An error occurred. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};