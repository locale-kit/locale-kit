import { assertEquals, assertObjectMatch } from "./_test.ts";

import { LocaleKit } from "../mod.ts";
import type { FuncType } from "../types/fn.ts";

Deno.test("Init with language", () => {
	const svc = new LocaleKit({
		languages: {
			en: {
				test: { key: "Test Key" },
			},
		},
	});

	assertObjectMatch(svc.languages, {
		en: {
			__data: {
				"test:o.key:s": "Test Key",
			},
			__map: {
				"test.key": "test:o.key:s",
			},
		},
	});
});

Deno.test("Add empty language", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {});

	assertObjectMatch(svc.languages, { en: {} });
});

Deno.test("Add language with translations", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		"test.key": "Test Key",
		"test.key2": "Test Key 2",
	});

	assertObjectMatch(svc.languages, {
		en: {
			__data: {
				"test%2Ekey:s": "Test Key",
				"test%2Ekey2:s": "Test Key 2",
			},
			__map: {
				"test.key": "test%2Ekey:s",
				"test.key2": "test%2Ekey2:s",
			},
		},
	});
});

Deno.test("Add language with translations and nested objects", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		common: {
			navigation: {
				title: "Test title",
			},
		},
	});

	assertObjectMatch(svc.languages, {
		en: {
			__data: {
				"common:o.navigation:o.title:s": "Test title",
			},
			__map: {
				"common.navigation.title": "common:o.navigation:o.title:s",
			},
		},
	});
});

Deno.test(
	"Add language with translations and nested objects and arrays",
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				navigation: {
					title: "Test title",
					items: [
						{
							title: "Test item 1",
						},
						{
							title: "Test item 2",
						},
					],
				},
			},
		});

		assertObjectMatch(svc.languages, {
			en: {
				__data: {
					"common:o.navigation:o.title:s": "Test title",
					"common:o.navigation:o.items:a.0:i;o.title:s": "Test item 1",
					"common:o.navigation:o.items:a.1:i;o.title:s": "Test item 2",
				},
				__map: {
					"common.navigation.title": "common:o.navigation:o.title:s",
					"common.navigation.items.0.title":
						"common:o.navigation:o.items:a.0:i;o.title:s",
					"common.navigation.items.1.title":
						"common:o.navigation:o.items:a.1:i;o.title:s",
				},
			},
		});
	},
);

Deno.test(
	"Add language with translations and nested objects and arrays and nested arrays",
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				navigation: {
					title: "Test title",
					items: [
						{
							title: "Test item 1",
							items: [
								{
									title: "Test item 1.1",
								},
								{
									title: "Test item 1.2",
								},
							],
						},
						{
							title: "Test item 2",
						},
					],
				},
			},
		});

		assertObjectMatch(svc.languages, {
			en: {
				__data: {
					"common:o.navigation:o.title:s": "Test title",
					"common:o.navigation:o.items:a.0:i;o.title:s": "Test item 1",
					"common:o.navigation:o.items:a.0:i;o.items:a.0:i;o.title:s":
						"Test item 1.1",
					"common:o.navigation:o.items:a.0:i;o.items:a.1:i;o.title:s":
						"Test item 1.2",
					"common:o.navigation:o.items:a.1:i;o.title:s": "Test item 2",
				},
				__map: {
					"common.navigation.title": "common:o.navigation:o.title:s",
					"common.navigation.items.0.title":
						"common:o.navigation:o.items:a.0:i;o.title:s",
					"common.navigation.items.0.items.0.title":
						"common:o.navigation:o.items:a.0:i;o.items:a.0:i;o.title:s",
					"common.navigation.items.0.items.1.title":
						"common:o.navigation:o.items:a.0:i;o.items:a.1:i;o.title:s",
					"common.navigation.items.1.title":
						"common:o.navigation:o.items:a.1:i;o.title:s",
				},
			},
		});
	},
);

Deno.test("Translate a key with no added data", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		common: {
			test: "Test string",
		},
	});

	assertEquals(svc.t("common.test"), "Test string");
});

Deno.test("Translate a key with added data", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		common: {
			test: "Hello {{key:'name'}}",
		},
	});

	assertEquals(svc.t("common.test", { name: "John Doe" }), "Hello John Doe");
});

Deno.test("Translate a key with added data and nested objects", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		common: {
			test: "Hello {{key:'user.name'}}",
		},
	});

	assertEquals(
		svc.t("common.test", { user: { name: "John Doe" } }),
		"Hello John Doe",
	);
});

Deno.test(
	"Translate a key with added data and nested objects and arrays",
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "Hello {{key:'user.name'}} {{key:'user.addresses.0.city'}}",
			},
		});

		assertEquals(
			svc.t("common.test", {
				user: { name: "John Doe", addresses: [{ city: "London" }] },
			}),
			"Hello John Doe London",
		);
	},
);

Deno.test(
	{
		name: "Translate a conditional key",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				message_count:
					"You have {{key:'count'}} [[~ {count} 1: `message` | default: `messages` ~]]",
			},
		});

		assertEquals(
			svc.t("common.message_count", { count: 1 }),
			"You have 1 message",
		);
		assertEquals(
			svc.t("common.message_count", { count: 2 }),
			"You have 2 messages",
		);
		assertEquals(
			svc.t("common.message_count", { count: 3 }),
			"You have 3 messages",
		);
		assertEquals(
			svc.t("common.message_count", { count: 0 }),
			"You have 0 messages",
		);
	},
);

Deno.test(
	{
		name: "Translate a conditional key with the semicolon-colon syntax",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				message_count:
					"You have {{key:'count'}} [[~ {count} 1: 'message' | default: 'messages' ~]]",
			},
		});

		assertEquals(
			svc.t("common.message_count", { count: 1 }),
			"You have 1 message",
		);
		assertEquals(
			svc.t("common.message_count", { count: 2 }),
			"You have 2 messages",
		);
		assertEquals(
			svc.t("common.message_count", { count: 3 }),
			"You have 3 messages",
		);
		assertEquals(
			svc.t("common.message_count", { count: 0 }),
			"You have 0 messages",
		);
	},
);

Deno.test(
	{
		name: "Print [fallback_key_missing] if default not found and fallback required",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				message_count: "You have {{key:'count'}} [[~ {count} 1: `message` ~]]",
			},
		});

		assertEquals(
			svc.t("common.message_count", { count: 1 }),
			"You have 1 message",
		);
		assertEquals(
			svc.t("common.message_count", { count: 2 }),
			"You have 2 [fallback_key_missing]",
		);
	},
);

Deno.test("Nest data inside translation formatting", () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		common: {
			message_count:
				"You have [[~ {count} 1: `only 1 message` | default: `{{key:'count'}} messages` ~]]",
		},
	});

	assertEquals(
		svc.t("common.message_count", { count: 1 }),
		"You have only 1 message",
	);
	assertEquals(
		svc.t("common.message_count", { count: 2 }),
		"You have 2 messages",
	);
	assertEquals(
		svc.t("common.message_count", { count: 3 }),
		"You have 3 messages",
	);
	assertEquals(
		svc.t("common.message_count", { count: 0 }),
		"You have 0 messages",
	);
});

Deno.test(
	{
		name: "Translate a key with added data and fallback a nested value if missing",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "Hello {{key:'user.name'}}||[john_doe]||",
			},
		});

		assertEquals(
			svc.t("common.test", { user: { name: "John Doe", age: 20 } }),
			"Hello John Doe",
		);

		assertEquals(
			svc.t("common.test", { user: { age: 20 } }),
			"Hello [john_doe]",
		);
	},
);

Deno.test(
	"Fallback to default language and default key if key not found on language",
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "Hello {{key:'name'}}",
				test2: "Hello {{key:'name'}} (test 2 en)",
				translation_error: "Translation error",
			},
			error: {
				unknown: "Unknown error",
			},
		});

		svc.addLanguage("fr", {
			common: {
				test: "Bonjour {{key:'name'}}",
			},
		});

		assertEquals(
			svc.t("common.test", { name: "John Doe", lang: "en" }),
			"Hello John Doe",
		);
		assertEquals(
			svc.t("common.test", { name: "John Doe", lang: "fr" }),
			"Bonjour John Doe",
		);
		assertEquals(
			svc.t("common.test", { name: "John Doe", lang: "es" }),
			"Hello John Doe",
		);
		assertEquals(svc.t("common.test", { name: "John Doe" }), "Hello John Doe");
		assertEquals(
			svc.t("common.test2", { name: "John Doe", lang: "fr" }),
			"Hello John Doe (test 2 en)",
		);
		assertEquals(
			svc.t("common.test3", { name: "John Doe", lang: "es" }),
			"Unknown error",
		);
	},
);

// A test for when a GT() case is found in a translation
Deno.test(
	{ name: "Translate a key with added data and nested objects" },
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "You are [[~ {age} GTE(num:18): `an adult` | default: `a child` ~]]",
			},
		});

		assertEquals(svc.t("common.test", { age: 18 }), "You are an adult");
		assertEquals(svc.t("common.test", { age: 17 }), "You are a child");
	},
);

Deno.test(
	{
		name: "Translate a key with added data and nested objects (this time with array lengths)",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "You have [[~ {friends} LEN_GTE(num:3): `some` | default: `a couple` ~]] friends",
			},
		});

		assertEquals(
			svc.t("common.test", { friends: ["goerge", "jeff", "amy"] }),
			"You have some friends",
		);
		assertEquals(
			svc.t("common.test", { friends: ["goerge", "jeff"] }),
			"You have a couple friends",
		);
	},
);

Deno.test(
	{
		name: "Translate a key with added data and nested objects (this time with string lengths)",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "This is a [[~ {str} LEN_GTE(num:12): `longer` | default: `shorter` ~]] string",
			},
		});

		assertEquals(
			svc.t("common.test", { str: "Hello World!" }),
			"This is a longer string",
		);
		assertEquals(
			svc.t("common.test", { str: "Hello!" }),
			"This is a shorter string",
		);
	},
);

Deno.test(
	{
		name: "Translate a key with added data and nested objects (this time with object lengths)",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test: "This is a [[~ {obj} LEN_GTE(num:3): `longer` | default: `shorter` ~]] object",
			},
		});

		assertEquals(
			svc.t("common.test", { obj: { key_1: true, key_2: true, key_3: true } }),
			"This is a longer object",
		);
		assertEquals(
			svc.t("common.test", { obj: { key_1: true, key_2: true } }),
			"This is a shorter object",
		);
	},
);

Deno.test({ name: "Translate a key and handle function calls" }, () => {
	const svc = new LocaleKit();

	svc.addLanguage("en", {
		common: {
			test_age:
				"You are [[~ {age} LTE(num:12): `a child` | BT(num:12, num:18): `a teenager` | GTE(num:18): `an adult` ~]]",
			test_array:
				"You have [[~ {messages.length} EQ(num:0): `no` | LTE(num:3): `some` | LTE(num:8): `a few` | LTE(num:40): `a lot of` | GTE(num:41): `too many` | default: `{{key:'messages.length'}}` ~]] messages",
		},
	});

	const arr = new Array(0);

	assertEquals(svc.t("common.test_age", { age: 18 }), "You are an adult");
	assertEquals(svc.t("common.test_age", { age: 13 }), "You are a teenager");
	assertEquals(svc.t("common.test_age", { age: 8 }), "You are a child");

	assertEquals(
		svc.t("common.test_array", { messages: arr }),
		"You have no messages",
	);
	arr.length = 3;
	assertEquals(
		svc.t("common.test_array", { messages: arr }),
		"You have some messages",
	);
	arr.length = 8;
	assertEquals(
		svc.t("common.test_array", { messages: arr }),
		"You have a few messages",
	);
	arr.length = 40;
	assertEquals(
		svc.t("common.test_array", { messages: arr }),
		"You have a lot of messages",
	);
	arr.length = 41;
	assertEquals(
		svc.t("common.test_array", { messages: arr }),
		"You have too many messages",
	);
});

// Create a test for when a case has a function argument
Deno.test.only(
	{
		name: "Translate a key and handle function calls that have function parameters",
	},
	() => {
		const svc = new LocaleKit();

		svc.addLanguage("en", {
			common: {
				test_age:
					"You are [[~ {age} CUSTOM(fn: 'isChild'): 'a child' | CUSTOM(fn: [isTeen]): 'a teenager' | CUSTOM(fn: [isAdult]): 'an adult' ~]]",
			},
		});

		const fns: Record<string, FuncType> = {
			isChild: ({ value: age }) => {
				return age <= 12;
			},
			isTeen: ({ value: age }) => {
				return age > 12 && age < 18;
			},
			isAdult: ({ value: age }) => {
				return age >= 18;
			},
		};

		assertEquals(
			svc.t("common.test_age", { age: 18 }, fns),
			"You are an adult",
		);
		assertEquals(
			svc.t("common.test_age", { age: 13 }, fns),
			"You are a teenager",
		);
		assertEquals(svc.t("common.test_age", { age: 8 }, fns), "You are a child");
		assertEquals(svc.t("common.test_age", { age: 0 }, fns), "You are a child");
		assertEquals(svc.t("common.test_age", { age: 12 }, fns), "You are a child");
		assertEquals(
			svc.t("common.test_age", { age: 17 }, fns),
			"You are a teenager",
		);
		assertEquals(
			svc.t("common.test_age", { age: 18 }, fns),
			"You are an adult",
		);
	},
);
