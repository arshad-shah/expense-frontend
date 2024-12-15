import { Currency, FirestoreTimestamp } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const formatCurrency = (amount: number, currencyType: Currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyType,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


// Helper function to parse the timestamp string
export function parseTimestamp(timestamp: FirestoreTimestamp): Date {
  if (typeof timestamp === 'string') {
    // Handle string format like "Timestamp(seconds=1734213549, nanoseconds=546000000)"
    const matches = timestamp.match(/seconds=(\d+),\s*nanoseconds=(\d+)/);
    if (matches) {
      const seconds = parseInt(matches[1]);
      const nanoseconds = parseInt(matches[2]);
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    }
    return new Date(timestamp);
  }
  
  if ('seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }
  
  if ('_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  }
  
  return new Date();
}



// src/utils/dateFormatter.ts

interface DateFormatterOptions {
  includeTime?: boolean;
  useRelative?: boolean;
  shortFormat?: boolean;
  threshold?: {
    recent: number;  // hours to consider "recent" for relative time
    future: boolean; // whether to handle future dates
  };
}

export const formatDate = (
  dateString: string,
  options: DateFormatterOptions = {
    includeTime: false,
    useRelative: true,
    shortFormat: false,
    threshold: {
      recent: 48, // Show relative time for the last 48 hours
      future: true
    }
  }
) => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string provided: ${dateString}`);
      return 'Invalid date';
    }

    const now = new Date();
    const diffInMilliseconds = date.getTime() - now.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Handle future dates if enabled
    if (options.threshold?.future && diffInMilliseconds > 0) {
      if (diffInMinutes < 1) return 'in a few seconds';
      if (diffInMinutes === 1) return 'in 1 minute';
      if (diffInMinutes < 60) return `in ${diffInMinutes} minutes`;
      if (diffInHours === 1) return 'in 1 hour';
      if (diffInHours < 24) return `in ${diffInHours} hours`;
      if (diffInDays === 1) return 'tomorrow';
      if (diffInDays < 7) return `in ${diffInDays} days`;
    }

    // Handle relative time for recent dates
    if (options.useRelative) {
      const isWithinThreshold = Math.abs(diffInHours) <= (options.threshold?.recent ?? 48);
      
      if (isWithinThreshold) {
        // Just now / few seconds ago
        if (Math.abs(diffInMinutes) < 1) {
          return 'just now';
        }

        // Minutes
        if (Math.abs(diffInMinutes) < 60) {
          const mins = Math.abs(diffInMinutes);
          return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
        }

        // Hours
        if (Math.abs(diffInHours) < 24) {
          const hrs = Math.abs(diffInHours);
          return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
        }
      }

      // Yesterday/Today
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === now.toDateString()) {
        return options.includeTime 
          ? `Today at ${formatTime(date)}` 
          : 'Today';
      }

      if (date.toDateString() === yesterday.toDateString()) {
        return options.includeTime 
          ? `Yesterday at ${formatTime(date)}` 
          : 'Yesterday';
      }
    }

    // Default date formatting
    if (options.shortFormat) {
      return formatShortDate(date, now);
    }

    return formatFullDate(date, now, options.includeTime ?? false);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatShortDate = (date: Date, now: Date): string => {
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : '2-digit'
  });
};

const formatFullDate = (date: Date, now: Date, includeTime: boolean): string => {
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : 'numeric'
  });

  if (!includeTime) return dateStr;
  
  return `${dateStr} at ${formatTime(date)}`;
};

// Example usage:
/*
formatDate('2024-03-15T10:30:00', { includeTime: true })
// Output: "2 hours ago" or "Today at 10:30 AM" or "Mar 15 at 10:30 AM"

formatDate('2024-03-15T10:30:00', { shortFormat: true })
// Output: "Mar 15"

formatDate('2024-03-15T10:30:00', { useRelative: false })
// Output: "Fri, Mar 15"

formatDate('2024-03-15T10:30:00', { 
  useRelative: true,
  threshold: { recent: 12, future: true }
})
// Output varies based on current time
*/