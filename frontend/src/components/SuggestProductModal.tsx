'use client';

import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X as XIcon, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
// Assuming useToast is available if we want to add success/error messages later
// import { useToast } from '@/components/ui/use-toast';

interface SuggestProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSubmit?: (data: SuggestionFormData) => void; // For future API integration
}

interface SuggestionFormData {
  name: string;
  email: string;
  productIdea: string;
  usageUrgency: string; // Changed from optional to string for controlled component
}

interface FormErrors {
  name?: string;
  email?: string;
  productIdea?: string;
}

const SuggestProductModal: React.FC<SuggestProductModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<SuggestionFormData>({
    name: '',
    email: '',
    productIdea: '',
    usageUrgency: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { toast } = useToast(); // Uncomment if toasts are needed

  // Reset form when modal is closed/reopened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        productIdea: '',
        usageUrgency: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.productIdea.trim()) {
      newErrors.productIdea = 'Product idea is required.';
    } else if (formData.productIdea.trim().length < 10) {
      newErrors.productIdea = 'Product idea must be at least 10 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      // Optionally, show a toast for validation errors
      // toast({ variant: "destructive", title: "Validation Error", description: "Please check the form." });
      return;
    }

    setIsSubmitting(true);
    console.log('Product Suggestion:', formData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    // toast({ title: "Suggestion Submitted", description: "Thank you for your product idea!" }); // Example toast
    onClose(); // Close modal on successful submission
  };

  if (!isOpen) {
    return null;
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 grid w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:transform-none motion-reduce:transition-none sm:rounded-lg'
          )}
        >
          <DialogPrimitive.Title className="text-xl font-semibold text-navy">
            Suggest a Product
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm text-muted-foreground">
            Have an idea for a product we should carry? Let us know! Your input helps us expand our
            catalog.
          </DialogPrimitive.Description>

          <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }} className="space-y-4">
            <div>
              <label
                htmlFor="suggestion-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name / Organization (Optional)
              </label>
              <Input
                id="suggestion-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Marie Curie"
                className={cn('focus-visible:ring-lime', errors.name && 'border-destructive')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error-modal' : undefined}
              />
              {errors.name && (
                <p id="name-error-modal" className="mt-1 text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="suggestion-email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email (Optional)
              </label>
              <Input
                id="suggestion-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="marie.curie@example.com"
                className={cn('focus-visible:ring-lime', errors.email && 'border-destructive')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error-modal' : undefined}
              />
              {errors.email && (
                <p id="email-error-modal" className="mt-1 text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="suggestion-idea"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Suggestion <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="suggestion-idea"
                name="productIdea"
                value={formData.productIdea}
                onChange={handleChange}
                placeholder="Describe the product or products you're looking for..."
                rows={4}
                className={cn(
                  'focus-visible:ring-lime',
                  errors.productIdea && 'border-destructive'
                )}
                aria-invalid={!!errors.productIdea}
                aria-describedby={errors.productIdea ? 'idea-error-modal' : undefined}
                required
              />
              {errors.productIdea && (
                <p id="idea-error-modal" className="mt-1 text-sm text-destructive">
                  {errors.productIdea}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="suggestion-usage"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Use & Urgency (Optional)
              </label>
              <Textarea
                id="suggestion-usage"
                name="usageUrgency"
                value={formData.usageUrgency}
                onChange={handleChange}
                placeholder="e.g., For metabolic research, needed within 2 weeks."
                rows={3}
                className="focus-visible:ring-lime"
              />
            </div>

            <div className="flex flex-col-reverse pt-2 sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-lime text-navy hover:bg-[#94DD00]"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5 animate-spin text-navy"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" /> Submit Idea
                  </>
                )}
              </Button>
            </div>
          </form>

          <DialogPrimitive.Close
            className="focus:ring-slate-950 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-400 absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default SuggestProductModal;