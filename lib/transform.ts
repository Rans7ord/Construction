/**
 * Converts a string from snake_case to camelCase
 */
function snakeToCamelString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects - convert to ISO date string
  if (obj instanceof Date) {
    return obj.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Handle date-like objects that might come from database
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    // Check if it has date-like properties or is a date wrapper
    if (obj.constructor && obj.constructor.name === 'Date') {
      return obj.toISOString().split('T')[0];
    }
    // If it's an empty object, it might be a corrupted date - return null
    if (Object.keys(obj).length === 0) {
      return null;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamelString(key);
    result[camelKey] = snakeToCamel(value);
  }

  return result;
}
