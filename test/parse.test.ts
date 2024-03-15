import { getArgTypes } from "../util/match/utils/parse.ts";
import { assertArrayIncludes } from "./_test.ts";

Deno.test("getArgTypes with empty string", () => {
	const result = getArgTypes("");
	assertArrayIncludes(result, []);
});

Deno.test("getArgTypes with string argument", () => {
	const result = getArgTypes("str:'Hello'");
	assertArrayIncludes(result, [["str", "str:'Hello'"]]);
});

Deno.test("getArgTypes with key argument", () => {
	const result = getArgTypes("key:'example_key'");
	assertArrayIncludes(result, [["key", "key:'example_key'"]]);
});

Deno.test("getArgTypes with bool argument", () => {
	const result = getArgTypes("bool:true");
	assertArrayIncludes(result, [["bool", "bool:true"]]);
});

Deno.test("getArgTypes with num argument", () => {
	const result = getArgTypes("num:42");
	assertArrayIncludes(result, [["num", "num:42"]]);
});

Deno.test("getArgTypes with func argument", () => {
	const result = getArgTypes("func: {example_function}");
	assertArrayIncludes(result, [["fun", "func: {example_function}"]]);
});

Deno.test("getArgTypes with unsupported argument", () => {
	const result = getArgTypes("unsupported");
	assertArrayIncludes(result, []);
});
