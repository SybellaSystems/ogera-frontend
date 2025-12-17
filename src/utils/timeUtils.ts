/**
 * Format a date string to relative time (e.g., "2hr ago", "1 day ago", "2 days ago")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // If date is in the future, return "Just now"
  if (diffInSeconds < 0) {
    return 'Just now';
  }

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than 1 hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  }

  // Less than 24 hours
  const diffInHours = Math.floor(diffInSeconds / 3600);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hr' : 'hr'} ago`;
  }

  // Less than 30 days
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  // Less than 12 months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  // Years
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

