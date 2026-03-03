/**
 * Generate a URL-friendly slug from a string
 * @param name - The string to convert to a slug
 * @returns URL-friendly slug
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Slugify with custom options
 */
export const slugify = (
  text: string,
  options?: { separator?: string; lowercase?: boolean },
): string => {
  const separator = options?.separator || '-';
  const lowercase = options?.lowercase ?? true;

  const slug = text
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, separator)
    .replace(new RegExp(`${separator}+`, 'g'), separator);

  return lowercase ? slug.toLowerCase() : slug;
};
