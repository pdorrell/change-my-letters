export type ReviewState = {
  reviewed: string[];
  soundsWrong: string[];
};

export function getReviewStateFromJson(jsonData: unknown): ReviewState {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid review state: expected an object');
  }

  if (!('reviewed' in jsonData) || !('soundsWrong' in jsonData)) {
    throw new Error('Invalid review state: missing required properties');
  }

  if (!Array.isArray(jsonData.reviewed)) {
    throw new Error('Invalid review state: "reviewed" must be an array of strings');
  }

  if (!Array.isArray(jsonData.soundsWrong)) {
    throw new Error('Invalid review state: "soundsWrong" must be an array of strings');
  }

  if (!jsonData.reviewed.every(item => typeof item === 'string')) {
    throw new Error('Invalid review state: all items in "reviewed" must be strings');
  }

  if (!jsonData.soundsWrong.every(item => typeof item === 'string')) {
    throw new Error('Invalid review state: all items in "soundsWrong" must be strings');
  }

  return {
    reviewed: jsonData.reviewed,
    soundsWrong: jsonData.soundsWrong
  };
}