import { LocaleKit } from "../mod.ts";
import type { FuncObj } from "../types/fn.ts";
import { assertArrayIncludes, assertObjectMatch } from "./_test.ts";
import { assertEquals } from "./_test.ts";

Deno.test("allSupported method returns an array of supported languages", () => {
	const localeKit = new LocaleKit({ languages: { en: {}, es: {} } });
	const result = localeKit.allSupported();
	const expected = ["en", "es"];

	assertArrayIncludes(result, expected);
});

Deno.test(
	"addLanguage method adds a new language to the LocaleKit instance",
	() => {
		const localeKit = new LocaleKit();
		const code = "fr";
		const lang = { greeting: "Bonjour" };

		localeKit.addLanguage(code, lang);

		const supported_result = localeKit.allSupported();
		const supported_expected = ["fr"];
		const langauges_result = localeKit.languages;
		const languages_expected = {
			fr: {
				__data: { "greeting:s": "Bonjour" },
				__map: { greeting: "greeting:s" },
			},
		};

		assertArrayIncludes(supported_result, supported_expected);
		assertObjectMatch(langauges_result, languages_expected);
	},
);
Deno.test(
	"hydrateLanguage method adds a new language to the LocaleKit instance",
	() => {
		const localeKit = new LocaleKit();
		const code = "fr";
		const lang = { greeting: "Bonjour" };

		localeKit.hydrateLanguage(code, lang);

		const supported_result = localeKit.allSupported();
		const supported_expected = ["fr"];
		const langauges_result = localeKit.languages;
		const languages_expected = {
			fr: {
				__data: { "greeting:s": "Bonjour" },
				__map: { greeting: "greeting:s" },
			},
		};

		assertArrayIncludes(supported_result, supported_expected);
		assertObjectMatch(langauges_result, languages_expected);
	},
);

Deno.test("hydrateLanguage method merges language if already supported", () => {
	const localeKit = new LocaleKit({
		languages: { fr: { greeting: "Bonjour" } },
	});
	const code = "fr";
	const lang = { farewell: "Au revoir" };

	localeKit.hydrateLanguage(code, lang);

	const supported_result = localeKit.allSupported();
	const supported_expected = ["fr"];

	const languages_result = localeKit.languages;
	const languages_expected = {
		fr: {
			__data: { "greeting:s": "Bonjour", "farewell:s": "Au revoir" },
			__map: { greeting: "greeting:s", farewell: "farewell:s" },
		},
	};

	assertArrayIncludes(supported_result, supported_expected);
	assertObjectMatch(languages_result, languages_expected);
});

Deno.test("hydrateLanguage method sets the language as hydrated", () => {
	const localeKit = new LocaleKit();
	const code = "fr";
	const lang = { greeting: "Bonjour" };

	localeKit.hydrateLanguage(code, lang);

	const hydrated_result = localeKit.isHydrated(code);
	const hydrated_expected = true;

	assertEquals(hydrated_result, hydrated_expected);
});

Deno.test(
	"setHydrated method adds the language code to the hydrated_languages array",
	() => {
		const localeKit = new LocaleKit();
		const code = "fr";

		localeKit.setHydrated(code);

		const hydrated_languages_result = localeKit.hydrated_languages;
		const hydrated_languages_expected = ["fr"];

		assertArrayIncludes(hydrated_languages_result, hydrated_languages_expected);
	},
);

Deno.test("isHydrated method returns true if language is hydrated", () => {
	const localeKit = new LocaleKit();
	const code = "fr";
	localeKit.setHydrated(code);

	const result = localeKit.isHydrated(code);
	const expected = true;

	assertEquals(result, expected);
});

Deno.test("isHydrated method returns false if language is not hydrated", () => {
	const localeKit = new LocaleKit();
	const code = "fr";

	const result = localeKit.isHydrated(code);
	const expected = false;

	assertEquals(result, expected);
});
Deno.test("isSupported method returns true for supported language code", () => {
	const localeKit = new LocaleKit({
		languages: { en: {}, es: {} },
	});
	const code = "en";

	const result = localeKit.isSupported(code);
	const expected = true;

	assertEquals(result, expected);
});

Deno.test(
	"isSupported method returns false for unsupported language code",
	() => {
		const localeKit = new LocaleKit({
			languages: { en: {}, es: {} },
		});
		const code = "fr";

		const result = localeKit.isSupported(code);
		const expected = false;

		assertEquals(result, expected);
	},
);
Deno.test(
	"getKey method returns the correct value for a supported language and existing key",
	() => {
		const localeKit = new LocaleKit({
			languages: { en: { greeting: "Hello" } },
			fallback_language: "en",
			fallback_key: "fallback",
		});
		const lang_code = "en";
		const key = "greeting";

		const result = localeKit.getKey(lang_code, key);
		const expected = "Hello";

		assertEquals(result, expected);
	},
);

Deno.test(
	"getKey method returns the fallback value for an unsupported language",
	() => {
		const localeKit = new LocaleKit({
			languages: { en: { greeting: "Hello" } },
			fallback_language: "en",
			fallback_key: "fallback",
		});
		const lang_code = "fr";
		const key = "greeting";

		const result = localeKit.getKey(lang_code, key);
		const expected = "Hello";

		assertEquals(result, expected);
	},
);

Deno.test(
	"getKey method returns the fallback value for a supported language and non-existing key",
	() => {
		const localeKit = new LocaleKit({
			languages: {
				en: { greeting: "Hello", fallback: "fallback" },
				fr: { greeting: "Bonjour", fallback: "repli" },
			},
			fallback_language: "en",
			fallback_key: "fallback",
		});
		const lang_code = "fr";
		const key = "farewell";

		const result = localeKit.getKey(lang_code, key);
		const expected = "repli";

		assertEquals(result, expected);
	},
);

Deno.test(
	"getKey method returns the specified fallback language and key for an unsupported language and non-existing key",
	() => {
		const localeKit = new LocaleKit({
			languages: { en: { greeting: "Hello", fallback: "fallback" } },
			fallback_language: "en",
			fallback_key: "fallback",
		});
		const lang_code = "fr";
		const key = "farewell";

		const result = localeKit.getKey(lang_code, key);
		const expected = "fallback";

		assertEquals(result, expected);
	},
);

Deno.test(
	"getKey method returns '__NOT_FOUND__' for an unsupported language and non-existing fallback key",
	() => {
		const localeKit = new LocaleKit({
			languages: { en: { greeting: "Hello" } },
			fallback_language: "en",
			fallback_key: "fallback",
		});
		const lang_code = "fr";
		const key = "farewell";

		const result = localeKit.getKey(lang_code, key);
		const expected = "__NOT_FOUND__";

		assertEquals(result, expected);
	},
);

//
//
// getTranslationFunc
Deno.test("getTranslationFunc returns a function", () => {
	const localeKit = new LocaleKit();
	const lang_code = "en";

	const result = localeKit.getTranslationFunc(lang_code);

	assertEquals(typeof result, "function");
});

Deno.test("getTranslationFunc returns a function that returns a string", () => {
	const localeKit = new LocaleKit();
	const lang_code = "en";
	const translationFunc = localeKit.getTranslationFunc(lang_code);

	const result = translationFunc("greeting");

	assertEquals(typeof result, "string");
});

Deno.test("getTranslationFunc returns the correct translation", () => {
	const localeKit = new LocaleKit({
		languages: { en: { greeting: "Hello" } },
	});
	const lang_code = "en";
	const translationFunc = localeKit.getTranslationFunc(lang_code);

	const result = translationFunc("greeting");
	const expected = "Hello";

	assertEquals(result, expected);
});

Deno.test(
	"getTranslationFunc passes options and functions to the translation method",
	() => {
		const localeKit = new LocaleKit({
			languages: {
				en: {
					greeting: "Hello, {{key: 'name'}}",
				},
			},
		});
		const lang_code = "en";
		const translationFunc = localeKit.getTranslationFunc(lang_code);

		const options = { name: "John" };
		const functions: FuncObj = {
			capitalize: ({ value }) => value.toUpperCase(),
		};

		const result = translationFunc("greeting", options, functions);
		const expected = "Hello, John";

		assertEquals(result, expected);
	},
);
