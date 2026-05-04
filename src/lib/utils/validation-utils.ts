/**
 * Check if a string is a valid URL
 *
 * IMPORTANT: This only returns true if the ENTIRE string is a URL.
 * If the string contains URLs but also has other text (like a job description
 * that includes company website links), it will return false and allow parsing.
 *
 * Examples:
 * - "https://company.com/careers" → true (entire input is a URL)
 * - "Software Engineer\nApply at https://company.com/careers" → false (contains other text)
 *
 * @param str - The string to validate
 * @returns true if the entire string is a valid URL, false otherwise
 */
export const isValidUrl = (str: string): boolean => {
  if (!str || !str.trim()) return false;

  // Remove whitespace
  const trimmed = str.trim();

  // Check if it looks like a URL (starts with http://, https://, or www.)
  // Note: Using ^ and $ anchors ensures we only match if the ENTIRE string is a URL
  const urlPattern =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

  // Also check for common URL patterns
  if (trimmed.match(urlPattern)) {
    try {
      // Try to create a URL object (handles relative URLs too)
      new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return true;
    } catch {
      // If it matches the pattern but URL constructor fails, still consider it a URL-like string
      return (
        trimmed.includes('.') &&
        (trimmed.includes('http') ||
          trimmed.includes('www.') ||
          trimmed.includes('/'))
      );
    }
  }

  return false;
};
