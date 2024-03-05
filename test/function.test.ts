import {
	assertEquals,
	assertObjectMatch,
} from "https://deno.land/std@0.218.2/assert/mod.ts";
import { getFunctionParameters } from "../util/function.ts";

Deno.test("getFunctionParameters with no arguments", () => {
	const str = "Hello, world!";
	const result = getFunctionParameters(str);
	assertEquals(result, []);
});

Deno.test("getFunctionParameters with multiple arguments", () => {
	const fns = {
		isAdult: (a: unknown) => console.log(a),
	};

	const test_a = "EQ(str:`John Doe`)";
	const test_b = "EQ(num:25)";
	const test_c = "EQ(bool:true)";
	const test_d = "EQ(key:{user.name})";
	const test_e = "EQ(str:`John Doe`, num:25)";
	const test_f = "EQ(str:`John Doe`, bool:true)";
	const test_g = "EQ(fn: { utils.isAdult })";
	const [result_a] = getFunctionParameters(test_a);
	const [result_b] = getFunctionParameters(test_b);
	const [result_c] = getFunctionParameters(test_c);
	const [result_d] = getFunctionParameters(test_d, {
		user: { name: "John Doe Keyed" },
	});
	const [result_e] = getFunctionParameters(test_e);
	const [result_f] = getFunctionParameters(test_f);
	const [result_g] = getFunctionParameters(
		test_g,
		{},
		{
			utils: {
				isAdult: (a: unknown) => console.log(a),
			},
		},
	);

	const e = (result: unknown): Record<string, unknown> =>
		result as Record<string, unknown>;

	assertObjectMatch(e(result_a), { val: "John Doe", type: "str" });
	assertObjectMatch(e(result_b), { val: 25, type: "num" });
	assertObjectMatch(e(result_c), { val: true, type: "bool" });
	assertObjectMatch(e(result_d), { val: "John Doe Keyed", type: "key" });
	assertObjectMatch(e(result_e), { val: "John Doe", type: "str" });
	assertObjectMatch(e(result_f), { val: "John Doe", type: "str" });
	// assertObjectMatch(e(result_g), {
	// 	val: fns.isAdult,
	// 	type: "fn",
	// });
	assertEquals(
		// deno-lint-ignore ban-unused-ignore
		// deno-lint-ignore ban-types
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		(e(result_g) as { val: Function }).val.toString(),
		fns.isAdult.toString(),
	);
	assertEquals(e(result_g).type, "fn");
});
