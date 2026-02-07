/**
 * COMPREHENSIVE DATE UTILITY - FIXES ALL "Invalid Date" ISSUES
 * This replaces lib/date-utils.ts with bulletproof date handling
 */

/**
 * Core function to safely parse ANY date input
 * Returns a valid Date object or null
 */
function safeParseDate(dateInput: any): Date | null {
  // Handle null/undefined/empty
  if (!dateInput || dateInput === '') {
    return null;
  }

  try {
    // Already a Date object
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput;
    }

    // Handle string inputs
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (trimmed === '' || trimmed === 'Invalid Date') {
        return null;
      }

      // Try parsing the string
      const parsed = new Date(trimmed);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Handle number (timestamp)
    if (typeof dateInput === 'number') {
      const parsed = new Date(dateInput);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Handle objects with date properties (like {startDate: "2024-01-01"})
    if (typeof dateInput === 'object') {
      // Try common property names
      const dateValue = dateInput.date || dateInput.value || dateInput.toString();
      return safeParseDate(dateValue);
    }

    return null;
  } catch (error) {
    console.warn('Date parsing error:', error, 'Input:', dateInput);
    return null;
  }
}

/**
 * Format date as YYYY-MM-DD (safe, never returns "Invalid Date")
 */
export function formatDate(dateInput: any): string {
  const date = safeParseDate(dateInput);
  
  if (!date) {
    return 'N/A';
  }

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', dateInput);
    return 'N/A';
  }
}

/**
 * Format date for HTML input fields (YYYY-MM-DD)
 * Returns empty string if invalid (for form inputs)
 */
export function formatDateForInput(dateInput: any): string {
  const date = safeParseDate(dateInput);
  
  if (!date) {
    return '';
  }

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Date formatting error for input:', error, 'Input:', dateInput);
    return '';
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayForInput(): string {
  return formatDateForInput(new Date());
}

/**
 * Parse date string and return Date object or null
 */
export function parseDate(dateString: any): Date | null {
  return safeParseDate(dateString);
}

/**
 * Check if a date value is valid
 */
export function isValidDate(dateInput: any): boolean {
  return safeParseDate(dateInput) !== null;
}

/**
 * Format date for database storage (YYYY-MM-DD)
 */
export function formatDateForDB(dateInput: any): string {
  const formatted = formatDateForInput(dateInput);
  return formatted || new Date().toISOString().split('T')[0];
}

/**
 * Compare two dates - returns true if date1 is before date2
 */
export function isDateBefore(date1: any, date2: any): boolean {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  
  if (!d1 || !d2) {
    return false;
  }
  
  return d1.getTime() < d2.getTime();
}

/**
 * Compare two dates - returns true if date1 is after date2
 */
export function isDateAfter(date1: any, date2: any): boolean {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  
  if (!d1 || !d2) {
    return false;
  }
  
  return d1.getTime() > d2.getTime();
}

/**
 * Format date in a human-friendly way
 * Examples: "Jan 15, 2024" or "Feb 7, 2026"
 */
export function formatDateFriendly(dateInput: any): string {
  const date = safeParseDate(dateInput);
  
  if (!date) {
    return 'N/A';
  }

  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.warn('Friendly date formatting error:', error, 'Input:', dateInput);
    return 'N/A';
  }
}

/**
 * Get date range string
 */
export function formatDateRange(startDate: any, endDate: any): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === 'N/A' && end === 'N/A') {
    return 'N/A';
  }
  
  if (start === 'N/A') {
    return `Until ${end}`;
  }
  
  if (end === 'N/A') {
    return `From ${start}`;
  }
  
  return `${start} - ${end}`;
}