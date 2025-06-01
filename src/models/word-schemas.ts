import { z } from 'zod';

/**
 * Zod schema for validating Word JSON data
 * Matches the format expected by Word.fromJson and produced by Word.toJson
 */
export const wordSchema = z.object({
  delete: z.string().optional(),
  insert: z.string().optional(),
  replace: z.string().optional()
});

/**
 * Zod schema for validating WordGraph JSON data
 * Matches the format expected by WordGraph.loadFromJson and produced by WordGraph.toJson
 */
export const wordGraphSchema = z.record(z.string(), wordSchema);