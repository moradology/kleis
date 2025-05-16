'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
  subtotal: number;
  shippingCostText: string;
  taxText: string;
  grandTotal: number;
  onCheckout: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shippingCostText,
  taxText,
  grandTotal,
  onCheckout,
}) => {
  return (
    <section
      aria-labelledby="order-summary-heading"
      className="mt-16 rounded-lg bg-muted/30 p-6 lg:sticky lg:top-24 lg:col-span-5 lg:mt-0" // Adjusted top-28 to top-24
    >
      <h2
        id="order-summary-heading"
        className="border-b border-border pb-4 text-xl font-semibold text-primary"
      >
        Order Summary
      </h2>
      <dl className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-foreground">Subtotal</dt>
          <dd className="text-sm font-medium text-foreground">${(subtotal / 100).toFixed(2)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <dt className="text-base font-medium text-foreground">Estimated Shipping</dt>
          <dd className="text-sm font-medium text-muted-foreground">{shippingCostText}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-base font-medium text-foreground">Estimated Tax</dt>
          <dd className="text-sm font-medium text-muted-foreground">{taxText}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <dt className="text-lg font-bold text-primary">Order Total</dt>
          <dd className="text-lg font-bold text-primary">${(grandTotal / 100).toFixed(2)}</dd>
        </div>
      </dl>
      <div className="mt-8">
        <Button size="lg" className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </div>
      <div className="mt-6 text-center">
        <a
          href="/products"
          className="text-sm font-medium text-primary hover:text-primary/80 hover:underline"
        >
          or Continue Shopping <span aria-hidden="true"> &rarr;</span>
        </a>
      </div>
    </section>
  );
};

export default OrderSummary;
