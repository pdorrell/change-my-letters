import { z } from 'zod';

export type ReviewState = {
  reviewed: string[];
  soundsWrong: string[];
};

const reviewStateSchema = z.object({
  reviewed: z.array(z.string()),
  soundsWrong: z.array(z.string())
});

export function getReviewStateFromJson(jsonData: unknown): ReviewState {
  const parsed = reviewStateSchema.parse(jsonData);
  return parsed;
}