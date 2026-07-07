import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to standard string (e.g. Oct 24, 2026)
 */
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format relative time (e.g. 2 hours ago)
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return '';
  }
};

/**
 * Format Indian Currency (e.g. ₹ 1,50,000)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format numbers with K/M/Cr suffixes for Indian context
 */
export const formatCompactNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  if (number >= 10000000) {
    return (number / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
  }
  if (number >= 100000) {
    return (number / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
  }
  return number.toString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
