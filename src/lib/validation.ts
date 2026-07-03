/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { Lineup } from '../types';
import { LineupListSchema } from './schema';

// Domain allowlist definition for security enforcement
const ALLOWED_DOMAINS = [
  'localhost',
  'images.unsplash.com',
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'img.youtube.com',
  'i.ytimg.com'
];

/**
 * Validates whether a URL or path is allowed under the application security policy.
 */
export function isUrlAllowed(urlString: string): boolean {
  if (!urlString) return false;
  // Allow relative files/paths starting with '/' and base64 embedded data assets
  if (urlString.startsWith('/') || urlString.startsWith('data:')) {
    return true;
  }
  try {
    const parsed = new URL(urlString);
    return ALLOWED_DOMAINS.some(
      domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Validates and freezes lineup data at runtime to ensure security constraints and read-only integrity.
 * @param rawData The raw JSON object imported or fetched
 * @returns Immutable validated Lineup objects
 */
export function validateAndFreezeLineups(rawData: unknown): Lineup[] {
  const result = LineupListSchema.safeParse(rawData);
  if (!result.success) {
    console.error("Zod runtime validation failed:", result.error.format());
    throw new Error(`Dados inválidos detetados pela política de validação: ${result.error.message}`);
  }

  // Freeze recursively to fulfill "Dados do JSON são readonly (Object.freeze em runtime)"
  const deepFreeze = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (
          Object.prototype.hasOwnProperty.call(obj, prop) &&
          obj[prop] !== null &&
          (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
          !Object.isFrozen(obj[prop])
        ) {
          deepFreeze(obj[prop]);
        }
      });
    }
    return obj;
  };

  return deepFreeze(result.data);
}
