import DOMPurify from 'dompurify';

export const sanitizePlainText = (text: string): string => {
  if (typeof window === 'undefined') return text;
  return DOMPurify.sanitize(text, {ALLOWED_TAGS: [], ALLOWED_ATTR: []});
};
