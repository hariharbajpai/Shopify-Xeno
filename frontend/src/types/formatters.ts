export const formatCurrency = (
  value: number,
  currency: string = 'INR',
  compact: boolean = true
): string => {
  if (compact && Math.abs(value) >= 1000) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });
    return formatter.format(value);
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, compact: boolean = true): string => {
  if (compact && Math.abs(value) >= 1000) {
    const formatter = new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });
    return formatter.format(value);
  }

  return new Intl.NumberFormat('en-IN').format(value);
};

export const formatDate = (
  date: Date | number | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
  };

  switch (format) {
    case 'short':
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    default:
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
  }

  return new Intl.DateTimeFormat('en-IN', options).format(dateObj);
};

export const calculateDelta = (current: number, previous: number): {
  value: number;
  percentage: number;
  isPositive: boolean;
} => {
  const delta = current - previous;
  const percentage = previous !== 0 ? (delta / previous) * 100 : 0;
  
  return {
    value: delta,
    percentage,
    isPositive: delta >= 0,
  };
};