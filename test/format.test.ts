import { assertEquals } from "https://deno.land/std@0.218.2/assert/mod.ts";
import { FunctionType } from "../types/fn.ts";
import { format } from "../util/format.ts";

Deno.test("Format with no data", () => {
	const str = "Hello, {{name}}!";
	const result = format(str);
	assertEquals(result, "Hello, [no_value]!");
});

Deno.test("Format with data", () => {
	const str = "Hello, {{name}}!";
	const data = { name: "John Doe" };
	const result = format(str, data);
	assertEquals(result, "Hello, John Doe!");
});

Deno.test("Format with nested data", () => {
	const str = "Hello, {{user.name}}!";
	const data = { user: { name: "John Doe" } };
	const result = format(str, data);
	assertEquals(result, "Hello, John Doe!");
});

Deno.test("Format with fallback value", () => {
	const str = "Hello, {{name}}||Guest||!";
	const data = { name: undefined };
	const result = format(str, data);
	assertEquals(result, "Hello, Guest!");
});

Deno.test("Format with conditional cases", () => {
	const str =
		"You have {{count}} [[~ {count} 1: `message` | default: `messages` ]]";
	const data1 = { count: 1 };
	const data2 = { count: 2 };
	const result1 = format(str, data1);
	const result2 = format(str, data2);
	assertEquals(result1, "You have 1 message");
	assertEquals(result2, "You have 2 messages");
});

Deno.test("Format with custom functions", () => {
	const str =
		"You are [[~ {age} GTE(num:18): `an adult` | default: `a child` ]]";
	const data1 = { age: 18 };
	const data2 = { age: 17 };

	const fns: Record<string, FunctionType<typeof data1>> = {
		GTE: (val: unknown, ctx: typeof data1) => (val as number) >= ctx.age,
	};

	const result1 = format(str, data1, fns);
	const result2 = format(str, data2, fns);
	assertEquals(result1, "You are an adult");
	assertEquals(result2, "You are a child");
});

Deno.test("Format with empty string", () => {
	const str = "";
	const result = format(str);
	assertEquals(result, "");
});

Deno.test("Format with no placeholders", () => {
	const str = "Hello, world!";
	const result = format(str);
	assertEquals(result, "Hello, world!");
});

Deno.test("Format with missing data", () => {
	const str = "Hello, {{name}}!";
	const result = format(str);
	assertEquals(result, "Hello, [no_value]!");
});

Deno.test("Format with missing nested data", () => {
	const str = "Hello, {{user.name}}!";
	const data = { user: {} };
	const result = format(str, data);
	assertEquals(result, "Hello, [no_value]!");
});

Deno.test("Format with missing fallback value", () => {
	const str = "Hello, {{name}}||Guest||!";
	const data = {};
	const result = format(str, data);
	assertEquals(result, "Hello, Guest!");
});

Deno.test("Format with invalid function", () => {
	const str =
		"You are [[~ {age} INVALID(num:18): `an adult` | default: `a child` ]]";
	const data = { age: 18 };
	const result = format(str, data);
	assertEquals(
		result,
		"You are [[~ {age} INVALID(num:18): `an adult` | default: `a child` ]]",
	);
});

Deno.test("Format with custom function", () => {
	const str =
		"You are [[~ {age} GTE(num:18): `an adult` | default: `a child` ]]";
	const data1 = { age: 18 };
	const data2 = { age: 17 };

	const fns: Record<string, FunctionType<typeof data1>> = {
		GTE: (val: unknown, ctx: typeof data1) => (val as number) >= ctx.age,
	};

	const result1 = format(str, data1, fns);
	const result2 = format(str, data2, fns);
	assertEquals(result1, "You are an adult");
	assertEquals(result2, "You are a child");
});
