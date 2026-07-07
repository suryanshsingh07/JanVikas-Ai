// Frontend Constants

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CATEGORIES = [
  { id: 'roads', label: 'Roads & Infrastructure', icon: 'Road' },
  { id: 'water', label: 'Water Supply', icon: 'Droplets' },
  { id: 'electricity', label: 'Electricity & Power', icon: 'Zap' },
  { id: 'education', label: 'Education & Schools', icon: 'GraduationCap' },
  { id: 'health', label: 'Healthcare & Hospitals', icon: 'Activity' },
  { id: 'sanitation', label: 'Sanitation & Waste', icon: 'Trash2' },
  { id: 'agriculture', label: 'Agriculture & Farming', icon: 'Tractor' },
  { id: 'housing', label: 'Housing & Shelter', icon: 'Home' },
  { id: 'employment', label: 'Employment & Jobs', icon: 'Briefcase' },
  { id: 'environment', label: 'Environment', icon: 'TreePine' },
  { id: 'security', label: 'Safety & Security', icon: 'Shield' },
  { id: 'transport', label: 'Public Transport', icon: 'Bus' },
  { id: 'other', label: 'Other Issues', icon: 'MoreHorizontal' },
];

export const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-info', bg: 'bg-info/10' },
  { id: 'medium', label: 'Medium', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'high', label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'critical', label: 'Critical', color: 'text-danger', bg: 'bg-danger/10' },
];

export const SUBMISSION_STATUSES = [
  { id: 'pending', label: 'Pending Review', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'reviewing', label: 'Under Review', color: 'text-info', bg: 'bg-info/10' },
  { id: 'approved', label: 'Approved for Action', color: 'text-primary-500', bg: 'bg-primary-500/10' },
  { id: 'in_progress', label: 'Work In Progress', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'resolved', label: 'Resolved', color: 'text-success', bg: 'bg-success/10' },
  { id: 'rejected', label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10' },
];

export const PROJECT_STATUSES = [
  { id: 'proposed', label: 'Proposed', color: 'text-info' },
  { id: 'approved', label: 'Budget Approved', color: 'text-primary-500' },
  { id: 'tendered', label: 'Tender Process', color: 'text-purple-500' },
  { id: 'ongoing', label: 'Construction Ongoing', color: 'text-warning' },
  { id: 'completed', label: 'Completed', color: 'text-success' },
  { id: 'on_hold', label: 'On Hold', color: 'text-orange-500' },
  { id: 'cancelled', label: 'Cancelled', color: 'text-danger' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
];
