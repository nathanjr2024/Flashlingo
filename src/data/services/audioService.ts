/**
 * Audio Service - Pronunciation Layer
 * Fetches native speaker audio from Wikimedia Commons with local caching
 * and TTS fallback via expo-speech.
 *
 * Primary source: Wikimedia Commons (CC BY-SA, no API key required)
 * Fallback: expo-speech (system TTS, fully offline)
 */
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';
const CACHE_DIR = `${FileSystem.documentDirectory}audio_cache/`;

export interface AudioResult {
  success: boolean;
  source: 'wikimedia' | 'tts' | 'none';
  attribution?: string;
  error?: string;
}

export class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;

  constructor() {
    this.ensureCacheDir();
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }
    } catch {
      // Cache dir creation may fail in test environments
    }
  }

  private getCachePath(word: string): string {
    const sanitized = word.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${CACHE_DIR}${sanitized}.mp3`;
  }

  async isCached(word: string): Promise<boolean> {
    try {
      const path = this.getCachePath(word);
      const info = await FileSystem.getInfoAsync(path);
      return info.exists;
    } catch {
      return false;
    }
  }

  private async fetchWikimediaAudio(
    word: string,
    language: string = 'en'
  ): Promise<{ url: string; attribution: string } | null> {
    try {
      const directTitles = [
        `File:En-us-${word}.ogg`,
        `File:En-${word}.ogg`,
        `File:${word}.ogg`,
        `File:En-us-${word}.mp3`,
        `File:En-${word}.mp3`,
      ];

      for (const title of directTitles) {
        const fileParams = new URLSearchParams({
          action: 'query',
          titles: title,
          prop: 'imageinfo',
          iiprop: 'url|extmetadata',
          format: 'json',
          origin: '*',
        });

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const fileResponse = await fetch(
            `${WIKIMEDIA_API}?${fileParams}`,
            { signal: controller.signal }
          );
          clearTimeout(timeout);

          if (!fileResponse.ok) continue;
          const fileData = await fileResponse.json();
          const pages = fileData?.query?.pages || {};
          const page = Object.values(pages)[0] as any;

          if (page?.missing) continue;

          const imageInfo = page?.imageinfo?.[0];
          if (imageInfo?.url) {
            const rawAttribution =
              imageInfo.extmetadata?.Artist?.value ||
              imageInfo.extmetadata?.Credit?.value ||
              'Wikimedia Commons';
            return {
              url: imageInfo.url,
              attribution: rawAttribution.replace(/<[^>]*>/g, ''),
            };
          }
        } catch {
          continue;
        }
      }

      // Broader search fallback
      const searchParams = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: `${word} pronunciation ${language}`,
        srnamespace: '6',
        srlimit: '5',
        format: 'json',
        origin: '*',
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const searchResponse = await fetch(
        `${WIKIMEDIA_API}?${searchParams}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!searchResponse.ok) return null;
      const searchData = await searchResponse.json();
      const results = searchData?.query?.search || [];

      for (const result of results) {
        const title = result.title;
        if (/\.(ogg|mp3|wav)$/i.test(title)) {
          const fileParams = new URLSearchParams({
            action: 'query',
            titles: title,
            prop: 'imageinfo',
            iiprop: 'url|extmetadata',
            format: 'json',
            origin: '*',
          });

          try {
            const c2 = new AbortController();
            const t2 = setTimeout(() => c2.abort(), 8000);
            const fileResponse = await fetch(
              `${WIKIMEDIA_API}?${fileParams}`,
              { signal: c2.signal }
            );
            clearTimeout(t2);

            if (!fileResponse.ok) continue;
            const fileData = await fileResponse.json();
            const pages = fileData?.query?.pages || {};
            const page = Object.values(pages)[0] as any;
            const imageInfo = page?.imageinfo?.[0];

            if (imageInfo?.url) {
              const rawAttr =
                imageInfo.extmetadata?.Artist?.value ||
                imageInfo.extmetadata?.Credit?.value ||
                'Wikimedia Commons';
              return {
                url: imageInfo.url,
                attribution: rawAttr.replace(/<[^>]*>/g, ''),
              };
            }
          } catch {
            continue;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private async downloadAndCache(
    url: string,
    word: string
  ): Promise<string | null> {
    try {
      const cachePath = this.getCachePath(word);
      const downloadResult = await FileSystem.downloadAsync(url, cachePath);
      return downloadResult.uri;
    } catch {
      return null;
    }
  }

  private async playFromFile(uri: string): Promise<AudioResult> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      this.sound = sound;
      this.isPlaying = true;

      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying) {
            this.isPlaying = false;
            resolve({ success: true, source: 'wikimedia' });
          }
        });

        setTimeout(() => {
          if (this.isPlaying) {
            this.isPlaying = false;
            resolve({ success: true, source: 'wikimedia' });
          }
        }, 10000);
      });
    } catch (error) {
      return {
        success: false,
        source: 'none',
        error: error instanceof Error ? error.message : 'Failed to play audio',
      };
    }
  }

  private async playTTS(
    word: string,
    language: string = 'en'
  ): Promise<AudioResult> {
    try {
      return new Promise((resolve) => {
        Speech.speak(word, {
          language,
          rate: 0.8,
          onDone: () => {
            resolve({ success: true, source: 'tts' });
          },
          onError: (error) => {
            resolve({
              success: false,
              source: 'none',
              error: error.message || 'TTS failed',
            });
          },
        });

        setTimeout(() => {
          resolve({ success: true, source: 'tts' });
        }, 5000);
      });
    } catch (error) {
      return {
        success: false,
        source: 'none',
        error: error instanceof Error ? error.message : 'TTS failed',
      };
    }
  }

  async playPronunciation(
    word: string,
    language: string = 'en'
  ): Promise<AudioResult> {
    // 1. Check local cache
    try {
      const cachePath = this.getCachePath(word);
      const cacheInfo = await FileSystem.getInfoAsync(cachePath);
      if (cacheInfo.exists) {
        const result = await this.playFromFile(cacheInfo.uri);
        if (result.success) {
          return { ...result, attribution: 'Cached (Wikimedia Commons)' };
        }
      }
    } catch {
      // Continue to fetch
    }

    // 2. Fetch from Wikimedia Commons
    const wikimediaResult = await this.fetchWikimediaAudio(word, language);
    if (wikimediaResult) {
      const localPath = await this.downloadAndCache(
        wikimediaResult.url,
        word
      );
      if (localPath) {
        const playResult = await this.playFromFile(localPath);
        if (playResult.success) {
          return {
            ...playResult,
            attribution: wikimediaResult.attribution,
          };
        }
      }
    }

    // 3. Fallback to TTS
    return this.playTTS(word, language);
  }

  async fetchPhonetic(
    word: string,
    language: string = 'en'
  ): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        action: 'parse',
        page: word,
        prop: 'wikitext',
        format: 'json',
        origin: '*',
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://${language}.wiktionary.org/w/api.php?${params}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!response.ok) return null;
      const data = await response.json();
      const wikitext = data?.parse?.wikitext?.['*'] || '';

      const ipaMatch =
        wikitext.match(/\{\{IPA\|\/([^/]+)\//i) ||
        wikitext.match(/\{\{pron\|\/([^/]+)\//i) ||
        wikitext.match(/\/([^/]+)\//);

      if (ipaMatch) {
        return `/${ipaMatch[1]}/`;
      }
      return null;
    } catch {
      return null;
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.isPlaying = false;
    Speech.stop();
  }

  async preFetch(
    word: string,
    language: string = 'en'
  ): Promise<AudioResult> {
    if (await this.isCached(word)) {
      return {
        success: true,
        source: 'wikimedia',
        attribution: 'Already cached',
      };
    }

    const wikimediaResult = await this.fetchWikimediaAudio(word, language);
    if (wikimediaResult) {
      const localPath = await this.downloadAndCache(
        wikimediaResult.url,
        word
      );
      if (localPath) {
        return {
          success: true,
          source: 'wikimedia',
          attribution: wikimediaResult.attribution,
        };
      }
    }

    return {
      success: false,
      source: 'none',
      error: 'No audio available for pre-fetch',
    };
  }

  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await this.ensureCacheDir();
    } catch {
      // Ignore errors during cache clearing
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      let totalSize = 0;
      for (const file of files) {
        const info = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
        if (info.exists && 'size' in info) {
          totalSize += info.size;
        }
      }
      return totalSize;
    } catch {
      return 0;
    }
  }
}

export const audioService = new AudioService();