import React from 'react';
import { cn } from '@/lib/utils';

interface StockStatusBadgeProps {
  liveOverallStockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock';
  className?: string;
}

const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({
  liveOverallStockStatus,
  className,
}) => {
  const stockStatusText =
    liveOverallStockStatus === 'Low Stock' ? 'Low Stock' : liveOverallStockStatus;

  const stockStatusStyles = {
    'In Stock': 'bg-lime text-navy',
    'Out of Stock': 'bg-destructive text-destructive-foreground',
    'Low Stock': 'bg-yellow-400 text-yellow-900', // Using yellow for low stock as planned
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-sm font-semibold',
        stockStatusStyles[liveOverallStockStatus] || stockStatusStyles['Out of Stock'], // Fallback to Out of Stock style if undefined
        className
      )}
    >
      {stockStatusText}
    </span>
  );
};

export default StockStatusBadge;
