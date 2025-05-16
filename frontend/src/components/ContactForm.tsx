'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing in a field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please check the form for errors and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors before new submission attempt

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as ApiResponse;

      if (response.ok && result.success) {
        toast({
          title: 'Message Sent!',
          description: result.message || "We'll be in touch soon.",
        });
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
      } else {
        // Handle server-side validation errors or other API errors
        const errorMessage = result.message || 'Failed to send message. Please try again.';
        if (
          result.errors &&
          typeof result.errors === 'object' &&
          Object.keys(result.errors).length > 0
        ) {
          // If the API returns specific field errors, you could potentially map them back to the form's error state.
          // For simplicity here, we'll just use the main message.
          // Example: const fieldErrorMessages = Object.values(result.errors).join(' ');
          // errorMessage = `${errorMessage} Details: ${fieldErrorMessages}`;
          // For example, to set specific errors:
          // const newApiErrors: FormErrors = {};
          // for (const key in result.errors) {
          //   if (Object.prototype.hasOwnProperty.call(result.errors, key) && key in formData) {
          //     newApiErrors[key as keyof FormErrors] = result.errors[key];
          //   }
          // }
          // setErrors(prev => ({...prev, ...newApiErrors}));
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }} className="space-y-6">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          Full Name
        </label>
        <Input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Rosalind Franklin"
          className={errors.name ? 'border-destructive' : ''}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          Email Address
        </label>
        <Input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="rosalind.franklin@example.com"
          className={errors.email ? 'border-destructive' : ''}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-foreground">
          Subject
        </label>
        <Input
          type="text"
          name="subject"
          id="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Regarding your product..."
          className={errors.subject ? 'border-destructive' : ''}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className="mt-1 text-sm text-destructive">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">
          Message
        </label>
        <Textarea
          name="message"
          id="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Please type your detailed message here..."
          rows={5}
          className={errors.message ? 'border-destructive' : ''}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;