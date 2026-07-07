import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely
 * Resolves conflicts like `px-2 px-4` -> `px-4`
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Delay execution (sleep)
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get category metadata by ID
 */
import { CATEGORIES, SUBMISSION_STATUSES, PRIORITIES } from '../constants';

export const getCategory = (id) => {
  return CATEGORIES.find((c) => c.id === id) || { label: 'Unknown', icon: 'HelpCircle' };
};

export const getStatus = (id) => {
  return SUBMISSION_STATUSES.find((s) => s.id === id) || SUBMISSION_STATUSES[0];
};

export const getPriority = (id) => {
  return PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];
};

/**
 * Convert file to base64 (useful for image previews)
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
};
