import { LocaleKit } from "./mod.ts";

const locale = new LocaleKit({
	languages: {
		en: {
			test: {
				key: "Test Key",
			},
		},
	},
	fallback_language: "en",
});

console.log(locale.t("test.key"));
