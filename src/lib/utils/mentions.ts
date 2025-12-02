/**
 * Mention Utilities
 * Functions for parsing and handling @mentions in comments
 */

import { prisma } from "@/lib/db/prisma";

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
 * @param usernames - Array of usernames to look up
 * @returns Array of user IDs
 */
export async function getUserIdsFromMentions(
  usernames: string[]
): Promise<string[]> {
  if (usernames.length === 0) return [];

  const users = await prisma.user.findMany({
    where: {
      username: {
        in: usernames,
        mode: "insensitive", // Case-insensitive search
      },
    },
    select: {
      id: true,
    },
  });

  return users.map((user) => user.id);
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
 * @param userIds - Array of user IDs
 * @returns Map of userId to username
 */
export async function getUsernamesFromIds(
  userIds: string[]
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      username: true,
    },
  });

  return new Map(
    users
      .filter((user) => user.username)
      .map((user) => [user.id, user.username!])
  );
}
