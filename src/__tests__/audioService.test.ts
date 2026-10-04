/**
 * Audio Service - Unit Tests
 * Tests for AudioService with mocked native modules.
 * jest.mock() calls are hoisted to the top by Jest automatically.
 */

// Mock expo-av
const mockUnloadAsync = jest.fn().mockResolvedValue(undefined);
const mockSetOnPlaybackStatusUpdate = jest.fn();
const mockCreateAsync = jest.fn().mockResolvedValue({
  sound: {
    unloadAsync: mockUnloadAsync,
    setOnPlaybackStatusUpdate: mockSetOnPlaybackStatusUpdate,
  },
});

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: (uri: any, opts: any) => mockCreateAsync(uri, opts),
    },
  },
}));

// Mock expo-speech
const mockSpeak = jest.fn((_text: string, _opts?: any) => {
  if (_opts?.onDone) _opts.onDone();
});
const mockStop = jest.fn();

jest.mock('expo-speech', () => ({
  speak: (text: string, opts?: any) => mockSpeak(text, opts),
  stop: () => mockStop(),
}));

// Mock expo-file-system/legacy
interface MockFileInfo {
  exists: boolean;
  size?: number;
  uri?: string;
}

const mockFiles: Record<string, MockFileInfo> = {};

const mockGetInfoAsync = jest.fn(async (path: string): Promise<MockFileInfo> => {
  return mockFiles[path] || { exists: false };
});
const mockMakeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
const mockDownloadAsync = jest.fn().mockImplementation(async (_url: string, dest: string) => {
  mockFiles[dest] = { exists: true, size: 1024, uri: dest };
  return { uri: dest };
});
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);
const mockReadDirectoryAsync = jest.fn().mockResolvedValue([] as string[]);

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/mock/documents/',
  getInfoAsync: (path: string) => mockGetInfoAsync(path),
  makeDirectoryAsync: (path: string, opts?: any) => mockMakeDirectoryAsync(path, opts),
  downloadAsync: (url: string, dest: string) => mockDownloadAsync(url, dest),
  deleteAsync: (path: string, opts?: any) => mockDeleteAsync(path, opts),
  readDirectoryAsync: (path: string) => mockReadDirectoryAsync(path),
}));

// Mock global fetch
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

// Import after mocks are declared (Jest hoists jest.mock above imports)
import { AudioService } from '../data/services/audioService';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockFiles).forEach((key) => delete mockFiles[key]);
    mockFetch.mockReset();
    service = new AudioService();
  });

  describe('isCached', () => {
    it('returns false when file does not exist', async () => {
      const result = await service.isCached('hello');
      expect(result).toBe(false);
    });

    it('returns true when file exists in cache', async () => {
      const cachePath = '/mock/documents/audio_cache/hello.mp3';
      mockFiles[cachePath] = { exists: true, size: 1024, uri: cachePath };
      const result = await service.isCached('hello');
      expect(result).toBe(true);
    });

    it('sanitizes word for cache path', async () => {
      const cachePath = '/mock/documents/audio_cache/give_up.mp3';
      mockFiles[cachePath] = { exists: true, size: 512, uri: cachePath };
      const result = await service.isCached('give up');
      expect(result).toBe(true);
    });
  });

  describe('playPronunciation', () => {
    it('plays from cache when available', async () => {
      const cachePath = '/mock/documents/audio_cache/hello.mp3';
      mockFiles[cachePath] = { exists: true, size: 1024, uri: cachePath };
      mockCreateAsync.mockImplementationOnce(async () => {
        const sound = {
          unloadAsync: mockUnloadAsync,
          setOnPlaybackStatusUpdate: (cb: any) => {
            setTimeout(() => cb({ isLoaded: true, isPlaying: false }), 10);
          },
        };
        return { sound };
      });
      const result = await service.playPronunciation('hello');
      expect(result.success).toBe(true);
      expect(result.source).toBe('wikimedia');
      expect(result.attribution).toContain('Cached');
    });

    it('fetches from Wikimedia when not cached', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '123': {
                imageinfo: [{
                  url: 'https://upload.wikimedia.org/test.ogg',
                  extmetadata: { Artist: { value: 'TestUser' } },
                }],
              },
            },
          },
        }),
      });
      mockCreateAsync.mockImplementationOnce(async () => {
        const sound = {
          unloadAsync: mockUnloadAsync,
          setOnPlaybackStatusUpdate: (cb: any) => {
            setTimeout(() => cb({ isLoaded: true, isPlaying: false }), 10);
          },
        };
        return { sound };
      });
      const result = await service.playPronunciation('hello');
      expect(result.success).toBe(true);
      expect(result.source).toBe('wikimedia');
      expect(result.attribution).toBe('TestUser');
      expect(mockDownloadAsync).toHaveBeenCalled();
    });

    it('falls back to TTS when Wikimedia fails', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });
      const result = await service.playPronunciation('xyzzy');
      expect(result.success).toBe(true);
      expect(result.source).toBe('tts');
      expect(mockSpeak).toHaveBeenCalledWith('xyzzy', expect.objectContaining({
        language: 'en',
        rate: 0.8,
      }));
    });

    it('falls back to TTS when Wikimedia returns missing page', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ query: { pages: { '-1': { missing: true } } } }),
      });
      const result = await service.playPronunciation('nonexistent');
      expect(result.success).toBe(true);
      expect(result.source).toBe('tts');
    });
  });

  describe('fetchPhonetic', () => {
    it('extracts IPA from Wiktionary wikitext', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          parse: { wikitext: { '*': '{{IPA|/həˈloʊ/|lang=en}}' } },
        }),
      });
      const result = await service.fetchPhonetic('hello');
      expect(result).toBe('/həˈloʊ/');
    });

    it('extracts IPA from pron template', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          parse: { wikitext: { '*': '{{pron|/ˈɛksæmpəl/|lang=en}}' } },
        }),
      });
      const result = await service.fetchPhonetic('example');
      expect(result).toBe('/ˈɛksæmpəl/');
    });

    it('extracts IPA from slash-delimited pattern', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          parse: { wikitext: { '*': 'Pronunciation: /wɜrd/' } },
        }),
      });
      const result = await service.fetchPhonetic('word');
      expect(result).toBe('/wɜrd/');
    });

    it('returns null when no IPA found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          parse: { wikitext: { '*': 'No pronunciation info here.' } },
        }),
      });
      const result = await service.fetchPhonetic('unknown');
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await service.fetchPhonetic('hello');
      expect(result).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      const result = await service.fetchPhonetic('hello');
      expect(result).toBeNull();
    });
  });

  describe('preFetch', () => {
    it('returns success when already cached', async () => {
      const cachePath = '/mock/documents/audio_cache/hello.mp3';
      mockFiles[cachePath] = { exists: true, size: 1024, uri: cachePath };
      const result = await service.preFetch('hello');
      expect(result.success).toBe(true);
      expect(result.attribution).toContain('cached');
    });

    it('downloads and caches when not cached', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '123': {
                imageinfo: [{
                  url: 'https://upload.wikimedia.org/test.ogg',
                  extmetadata: { Artist: { value: 'Author1' } },
                }],
              },
            },
          },
        }),
      });
      const result = await service.preFetch('hello');
      expect(result.success).toBe(true);
      expect(result.source).toBe('wikimedia');
      expect(result.attribution).toBe('Author1');
      expect(mockDownloadAsync).toHaveBeenCalled();
    });

    it('returns failure when no audio available', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ query: { pages: { '-1': { missing: true } } } }),
      });
      const result = await service.preFetch('nonexistent');
      expect(result.success).toBe(false);
      expect(result.source).toBe('none');
    });
  });

  describe('stop', () => {
    it('unloads sound and stops speech', async () => {
      await service.stop();
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('deletes cache directory and recreates it', async () => {
      await service.clearCache();
      expect(mockDeleteAsync).toHaveBeenCalled();
      expect(mockMakeDirectoryAsync).toHaveBeenCalled();
    });
  });

  describe('getCacheSize', () => {
    it('returns 0 when cache is empty', async () => {
      mockReadDirectoryAsync.mockResolvedValueOnce([]);
      const size = await service.getCacheSize();
      expect(size).toBe(0);
    });

    it('returns total size of cached files', async () => {
      mockReadDirectoryAsync.mockResolvedValueOnce(['hello.mp3', 'world.mp3']);
      mockGetInfoAsync
        .mockResolvedValueOnce({ exists: true, size: 1024, uri: '/mock/documents/audio_cache/hello.mp3' })
        .mockResolvedValueOnce({ exists: true, size: 2048, uri: '/mock/documents/audio_cache/world.mp3' });
      const size = await service.getCacheSize();
      expect(size).toBe(3072);
    });

    it('returns 0 on error', async () => {
      mockReadDirectoryAsync.mockRejectedValueOnce(new Error('Error'));
      const size = await service.getCacheSize();
      expect(size).toBe(0);
    });
  });

  describe('Wikimedia attribution', () => {
    it('strips HTML tags from attribution', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '123': {
                imageinfo: [{
                  url: 'https://upload.wikimedia.org/test.ogg',
                  extmetadata: { Artist: { value: '<a href="#">John Doe</a>' } },
                }],
              },
            },
          },
        }),
      });
      mockCreateAsync.mockImplementationOnce(async () => {
        const sound = {
          unloadAsync: mockUnloadAsync,
          setOnPlaybackStatusUpdate: (cb: any) => {
            setTimeout(() => cb({ isLoaded: true, isPlaying: false }), 10);
          },
        };
        return { sound };
      });
      const result = await service.playPronunciation('hello');
      expect(result.attribution).toBe('John Doe');
    });

    it('defaults to Wikimedia Commons when no artist', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '123': {
                imageinfo: [{
                  url: 'https://upload.wikimedia.org/test.ogg',
                  extmetadata: {},
                }],
              },
            },
          },
        }),
      });
      mockCreateAsync.mockImplementationOnce(async () => {
        const sound = {
          unloadAsync: mockUnloadAsync,
          setOnPlaybackStatusUpdate: (cb: any) => {
            setTimeout(() => cb({ isLoaded: true, isPlaying: false }), 10);
          },
        };
        return { sound };
      });
      const result = await service.playPronunciation('hello');
      expect(result.attribution).toBe('Wikimedia Commons');
    });
  });
});