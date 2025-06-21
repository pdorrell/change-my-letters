import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';

describe('AudioFilePlayerTestDouble', () => {
  let audioFilePlayer: AudioFilePlayerTestDouble;

  beforeEach(() => {
    audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
  });

  it('should track preloaded files', () => {
    audioFilePlayer.preload('words/cat');
    audioFilePlayer.preload('words/dog');
    audioFilePlayer.preload('words/cat'); // Duplicates should be handled

    expect(audioFilePlayer.preloadedFiles.has('words/cat')).toBe(true);
    expect(audioFilePlayer.preloadedFiles.has('words/dog')).toBe(true);
    expect(audioFilePlayer.preloadedFiles.size).toBe(2); // Set should deduplicate
  });

  it('should track played files', async () => {
    await audioFilePlayer.playAudioFile('words/cat');
    await audioFilePlayer.playAudioFile('words/dog');
    await audioFilePlayer.playAudioFile('words/cat'); // Should record duplicates

    expect(audioFilePlayer.playedFiles).toEqual(['words/cat', 'words/dog', 'words/cat']);
    expect(audioFilePlayer.playedFiles.length).toBe(3);
  });

  it('should return the correct baseUrl and extension', () => {
    expect(audioFilePlayer.baseUrl).toBe('/assets/words/amazon_polly');
    expect(audioFilePlayer.extension).toBe('.mp3');
  });

  it('should handle custom extension', () => {
    const customPlayer = new AudioFilePlayerTestDouble('/custom/path', '.wav');
    expect(customPlayer.baseUrl).toBe('/custom/path');
    expect(customPlayer.extension).toBe('.wav');
  });

  it('should provide verification functionality', async () => {
    const result = await audioFilePlayer.verifyFiles('deploy/assets/words/amazon_polly', ['words/test1', 'words/test2']);

    expect(result).toHaveProperty('allFilesExist');
    expect(result).toHaveProperty('missingFiles');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.missingFiles)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
