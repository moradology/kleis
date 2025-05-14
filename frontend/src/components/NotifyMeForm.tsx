'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming you have an Input component
import { useToast } from '@/components/ui/use-toast';
import { Mail, AlertTriangle } from 'lucide-react'; // Import AlertTriangle

interface NotifyMeFormProps {
  productSlug: string;
  variantSku?: string | null; // Optional, if notifying for a specific variant
}

const NotifyMeForm: React.FC<NotifyMeFormProps> = ({ productSlug, variantSku }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/notify-me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, productSlug, variantSku }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Notification Enabled!",
          description: result.message || "We'll notify you when it's back in stock.",
        });
        setEmail('');
      } else {
        throw new Error(result.message || 'Failed to set up notification.');
      }
    } catch (error) {
      console.error('Notify me submission error:', error);
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 border border-dashed border-primary/50 rounded-lg bg-muted/20">
      <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
        <AlertTriangle size={20} className="mr-2 text-destructive" />
        Sorry, we're out!
      </h3>
      <p className="text-sm text-foreground/80 mb-4">
        Enter your email and we'll let you know when this product is back in stock.
      </p>
      <form onSubmit={handleSubmit} className="flex w-full">
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="flex-grow rounded-r-none focus:z-10 relative"
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="border border-input rounded-l-none -ml-px flex-shrink-0 relative"
        >
          <Mail size={16} className="mr-2" />
          {isSubmitting ? 'Submitting...' : 'Notify Me'}
        </Button>
      </form>
    </div>
  );
};

export default NotifyMeForm;