/**
 * Date utility functions for consistent date handling across the application
 * All dates are displayed and stored in YYYY-MM-DD format
 */

/**
 * Formats a date for display (YYYY-MM-DD format: 2026-02-05)
 * Handles various input types: string, Date object, undefined, null
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  // Handle null/undefined
  if (!dateInput) {
    return 'N/A';
  }
  
  try {
    // Handle string inputs
    if (typeof dateInput === 'string') {
      // If it's already formatted or empty, return as-is or N/A
      if (dateInput.trim() === '') {
        return 'N/A';
      }
      
      // If already in YYYY-MM-DD format, validate and return
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const testDate = new Date(dateInput);
        if (!isNaN(testDate.getTime())) {
          return dateInput; // Already in correct format
        }
      }
      
      // Parse the date string
      const date = new Date(dateInput);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateInput);
        return 'Invalid Date';
      }
      
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) {
        console.warn('Invalid Date object');
        return 'Invalid Date';
      }
      
      // Format as YYYY-MM-DD
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    // Fallback for unexpected types
    console.warn('Unexpected date type:', typeof dateInput);
    return 'Invalid Date';
    
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a date for HTML input fields (YYYY-MM-DD)
 * Used in forms with date inputs
 * NOTE: This is the same as formatDate() - kept for semantic clarity
 */
export function formatDateForInput(dateInput: string | Date | undefined | null): string {
  // Handle null/undefined
  if (!dateInput) {
    return '';
  }
  
  try {
    let date: Date;
    
    // Handle string inputs
    if (typeof dateInput === 'string') {
      // If empty string, return empty
      if (dateInput.trim() === '') {
        return '';
      }
      
      // If already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        // Validate it's a real date
        const testDate = new Date(dateInput);
        if (!isNaN(testDate.getTime())) {
          return dateInput;
        }
      }
      
      date = new Date(dateInput);
    } 
    // Handle Date objects
    else if (dateInput instanceof Date) {
      date = dateInput;
    } 
    // Unexpected type
    else {
      console.warn('Unexpected date type for input:', typeof dateInput);
      return '';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for input:', dateInput);
      return '';
    }
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
    
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

/**
 * Gets today's date in YYYY-MM-DD format
 * Useful for default values in date inputs
 */
export function getTodayForInput(): string {
  return formatDateForInput(new Date());
}

/**
 * Parses a date string and returns a Date object
 * Returns null if parsing fails
 */
export function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Validates if a date string is valid
 */
export function isValidDate(dateString: string | undefined | null): boolean {
  if (!dateString || dateString.trim() === '') {
    return false;
  }
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Formats a date for database storage (YYYY-MM-DD)
 * Same as formatDateForInput, but semantically different purpose
 */
export function formatDateForDB(dateInput: string | Date | undefined | null): string {
  return formatDateForInput(dateInput);
}

/**
 * Compares two dates and returns true if date1 is before date2
 */
export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return false;
    }
    
    return d1.getTime() < d2.getTime();
  } catch (error) {
    return false;
  }
}

/**
 * Compares two dates and returns true if date1 is after date2
 */
export function isDateAfter(date1: string | Date, date2: string | Date): boolean {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return false;
    }
    
    return d1.getTime() > d2.getTime();
  } catch (error) {
    return false;
  }
}