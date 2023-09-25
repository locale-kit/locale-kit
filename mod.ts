import { FunctionType } from "./types/fn.ts";
import { format } from "./util/format.ts";
import { flattenObject } from "./util/obj.ts";

/**
 * The main translation/language class. This handles storage of languages,
 * translation/replacement of dynamic substrings, and the ability to add new
 * languages.
 */
export class LocaleKit {
  /**
   * A map of language codes and their given translations
   */
  languages: {
    [key: string]: {
      [key: string]: string;
    };
  } = {};
  /**
   * The language code to fall back to if the language is not supported
   */
  fallback_language = "en";
  /**
   * A key to fall back to if the key is not found in the given language.
   * If the fallback key is not found, the fallback language will be checked.
   * If the fallback key isn't found in the fallback language either, the value returned will be "__NOT_FOUND__"
   */
  fallback_key = "error.unknown";
  /**
   * A list of languages that have been hydrated/updated post class initialisation
   */
  hydrated_languages: string[] = [];

  /**
   * Construct a new LangaugeService class with the given languages and fallbacks
   * @param languages The languages to use
   * @param fallback_language The fallback language to use
   * @param fallback_key The fallback key to use
   */
  constructor({
    languages = {},
    fallback_language = "en",
    fallback_key = "error.unknown",
  }: {
    languages?: {
      [key: string]: Record<string, unknown>;
    };
    fallback_language?: string;
    fallback_key?: string;
  } = {}) {
    for (const key in languages) {
      this.addLanguage(key, languages[key]);
    }

    this.fallback_key = fallback_key;
    this.fallback_language = fallback_language;
  }

  /**
   * Returns an array of all supported languages
   * @returns Array of all the language codes supported
   */
  allSupported(): string[] {
    return Object.keys(this.languages);
  }

  /**
   * Add a new language into the languages object
   * @param code The language code to add
   * @param lang The language object to add
   */
  addLanguage(code: string, lang: Record<string, unknown>) {
    this.languages[code] = flattenObject(lang);
  }

  /**
   * Merge a new set of translations and keys into the language object
   * @param code The language code to use
   * @returns The language object for the given language code
   */
  hydrateLanguage(code: string, lang: Record<string, unknown>) {
    this.addLanguage(code, { ...this.languages[code], ...lang });
    this.setHydrated(code);
  }

  /**
   * Sets a language as hydrated
   * @param code The language code to set as hydrated
   */
  setHydrated(code: string) {
    this.hydrated_languages = Array.from(
      new Set([...this.hydrated_languages, code]),
    );
  }

  /**
   * Checks to see if a language is hydrated/updated
   * @param code The language code to check
   * @returns Whether the language is hydrated
   */
  isHydrated(code: string) {
    return this.hydrated_languages.includes(code);
  }

  /**
   * Checks if a language is supported
   * @param code The language code to check
   * @returns Whether the language is supported
   */
  isSupported(code: string): boolean {
    return !!this.languages[code];
  }

  /**
   * Returns the value for a specific language and key
   * @param lang_code The language code to use
   * @param key The key to translate/use
   * @returns The value of the translation/localisation key if it exists
   */
  getKey(lang_code: string, key: string): string {
    let lang = (lang_code || this.fallback_language) as string;
    if (!this.isSupported(lang)) {
      lang = this.fallback_language;
    }

    // Get the value from the language object for further processing
    const found = this.languages[lang]?.[key] ||
      this.languages[lang]?.[this.fallback_key] ||
      this.languages?.[this.fallback_language]?.[key] ||
      this.languages?.[this.fallback_language]?.[this.fallback_key] ||
      "__NOT_FOUND__";

    return found;
  }

  /**
   * Translates a key to a specific language, replacing substrings with necessary values as needed
   * @param key The key to translate/use
   * @param opts Options for the translation (lang, data, etc.)
   * @returns The translated string
   */
  t<T extends Record<string, unknown>>(
    key: string,
    opts?: T,
    functions?: Record<string, FunctionType<T>>,
  ) {
    // Make sure the langauge is supported
    const found = this.getKey(
      (opts?.lang || this.fallback_language) as string,
      key,
    );

    return format(found, opts || ({} as T), functions || {});
  }

  /**
   * Returns a new function for translating to a specific language replacing the t method
   * @param lang_code The language code to use
   * @returns Function taking place of the t method
   */
  getTranslationFunc(lang_code: string) {
    return (key: string, opts: Record<string, unknown> = {}) => {
      return this.t(key, { lang: lang_code, ...opts });
    };
  }
}

export const parseString = format;
