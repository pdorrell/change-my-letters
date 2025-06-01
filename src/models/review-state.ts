export type ReviewState = {
  reviewed: string[];
  soundsWrong: string[];
};

export function getReviewStateFromJson(jsonData: unknown): ReviewState {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid review state: expected an object');
  }

  const data = jsonData as Record<string, unknown>;

  if (!Array.isArray(data.reviewed)) {
    throw new Error('Invalid review state: "reviewed" must be an array of strings');
  }

  if (!Array.isArray(data.soundsWrong)) {
    throw new Error('Invalid review state: "soundsWrong" must be an array of strings');
  }

  if (!data.reviewed.every(item => typeof item === 'string')) {
    throw new Error('Invalid review state: all items in "reviewed" must be strings');
  }

  if (!data.soundsWrong.every(item => typeof item === 'string')) {
    throw new Error('Invalid review state: all items in "soundsWrong" must be strings');
  }

  return {
    reviewed: data.reviewed as string[],
    soundsWrong: data.soundsWrong as string[]
  };
}