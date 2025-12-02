/**
 * Mention Utilities
 * Functions for parsing and handling @mentions in comments
 */

// import { prisma } from '@/lib/prisma'; // Removed to prevent client-side import

/**
 * Regular expression to match @mentions
 * Matches @username where username is alphanumeric + underscores
 */
export const MENTION_REGEX = /@(\w+)/g;

/**
 * Extract all mentions from text
 * @param text - The text to parse for mentions
 * @returns Array of unique usernames mentioned (without @)
 */
export function extractMentions(text: string): string[] {
  const matches = text.matchAll(MENTION_REGEX);
  const usernames = new Set<string>();

  for (const match of matches) {
    usernames.add(match[1]);
  }

  return Array.from(usernames);
}

/**
 * Get user IDs for mentioned usernames
 * NOTE: This should be called server-side only via API endpoint
 * @param usernames - Array of usernames to look up
 * @returns Array of user IDs
 */
export async function getUserIdsFromMentions(
  usernames: string[]
): Promise<string[]> {
  // This function should be called from API route, not client component
  return [];
}

/**
 * Parse comment content and return mention data
 * @param content - Comment content
 * @returns Object with usernames and user IDs
 */
export async function parseMentions(content: string): Promise<{
  usernames: string[];
  userIds: string[];
}> {
  const usernames = extractMentions(content);
  const userIds = await getUserIdsFromMentions(usernames);

  return {
    usernames,
    userIds,
  };
}

/**
 * Highlight mentions in text for UI display
 * @param text - The text to process
 * @returns Text with mentions wrapped in HTML spans
 */
export function highlightMentions(text: string): string {
  return text.replace(
    MENTION_REGEX,
    '<span class="text-primary-400 font-medium">$&</span>'
  );
}

/**
 * Get usernames from user IDs
 * NOTE: This should be called server-side only via API endpoint
 * @param userIds - Array of user IDs
 * @returns Map of userId to username
 */
export async function getUsernamesFromIds(
  userIds: string[]
): Promise<Map<string, string>> {
  // This function should be called from API route, not client component
  return new Map();
}
