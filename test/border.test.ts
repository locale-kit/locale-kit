import { unescapeStringBorder } from "../util/match/utils/border.ts";
import { assertEquals } from "./_test.ts";

const caseTitle = (case_title: string) =>
	`unescapeStringBorder with ${case_title}`;

Deno.test(caseTitle("empty string"), () => {
	const result = unescapeStringBorder("", "'");
	assertEquals(result, "");
});

Deno.test(caseTitle("no border character"), () => {
	const result = unescapeStringBorder("Hello, world!", "'");
	assertEquals(result, "Hello, world!");
});

Deno.test(caseTitle("single border character"), () => {
	const result = unescapeStringBorder("Hell'o", "'");
	assertEquals(result, "Hell");
});

Deno.test(caseTitle("escaped border characters"), () => {
	const result = unescapeStringBorder("Hello\\'", "'");
	assertEquals(result, "Hello'");
});

Deno.test(caseTitle("escaped border character in middle"), () => {
	const result = unescapeStringBorder("Hello\\'world", "'");
	assertEquals(result, "Hello'world");
});

Deno.test(caseTitle("escaped backslashes"), () => {
	const result = unescapeStringBorder("Hello\\\\\\'", "'");
	assertEquals(result, "Hello\\'");
});

Deno.test(caseTitle("multiple border characters"), () => {
	const result = unescapeStringBorder("Hello''''", "'");
	assertEquals(result, "Hello");
});

Deno.test(caseTitle("border character at the beginning"), () => {
	const result = unescapeStringBorder("'Hello", "'");
	assertEquals(result, "");
});

Deno.test(caseTitle("border character at the end"), () => {
	const result = unescapeStringBorder("Hello'", "'");
	assertEquals(result, "Hello");
});

Deno.test(caseTitle("border character in the middle"), () => {
	const result = unescapeStringBorder("Hel'lo", "'");
	assertEquals(result, "Hel");
});
