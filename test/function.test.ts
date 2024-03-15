import { getLen } from "../util/getLen.ts";
import { assertEquals } from "./_test.ts";

Deno.test("getLen with string argument", () => {
	const result = getLen("Hello");
	assertEquals(result, 5);
});

Deno.test("getLen with array argument", () => {
	const result = getLen([1, 2, 3]);
	assertEquals(result, 3);
});

Deno.test("getLen with object argument", () => {
	const result = getLen({ a: 1, b: 2, c: 3 });
	assertEquals(result, 3);
});

Deno.test("getLen with number argument", () => {
	const result = getLen(42);
	assertEquals(result, 42);
});

Deno.test("getLen with bigint argument (less than MAXSAFEINT)", () => {
	const result = getLen(BigInt(123));
	assertEquals(result, 123);
});

Deno.test("getLen with bigint argument (greater than MAXSAFEINT)", () => {
	const result = getLen(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1));
	assertEquals(Number.isNaN(result), true);
});

Deno.test("getLen with unsupported argument", () => {
	const result = getLen(null);
	assertEquals(Number.isNaN(result), true);
});
