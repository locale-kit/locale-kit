import type { Any } from "../types/any.ts";
import type { FuncArgsType, FuncType } from "../types/fn.ts";
import { getLen } from "./getLen.ts";
import { isArray, isMap, isObject, isString } from "./is.ts";

export const MAXSAFEINT = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Reduces an array of values to the sum of all numbers in the array.
 *
 * @param params - An array of values.
 * @returns The sum of all numbers in the array.
 */
const reduceNumbers = (params: unknown[]): number =>
	(params.filter((e) => typeof e === "number") as number[]).reduce(
		(acc, cur) => acc + cur,
		0,
	);

/**
 * Checks if the number of parameters matches the specified limit.
 *
 * @param limit - The expected number of parameters.
 * @param params - An array of parameters.
 * @param val - The value to be checked.
 * @returns A boolean indicating whether the number of parameters matches the limit and the value is truthy.
 */
const paramLimiter = (
	limit: number,
	params: unknown[],
	val: unknown,
): boolean => (params.length !== limit ? false : !!val);

const handleLen = (opts: FuncArgsType, fn: FuncType) => {
	const val_len = getLen(opts.value);

	if (Number.isNaN(val_len)) return false;
	return fn({ ...opts, value: val_len });
};

const arrayify = (b: Any): Any[] => {
	switch (true) {
		case isArray(b):
			return b;
		case isString(b):
			return b.split(" ");
		case isObject(b):
			return Object.keys(b);
		case isMap(b):
			return Array.from(b.keys());
		default:
			return [];
	}
};

/**
 * Map of functions with their corresponding names and implementations.
 * The key is the function name and the value is the function implementation.
 */
const FUNCS: Map<string, FuncType<Any, Any[]>> = new Map([
	["GT", ({ value: a, params }) => a > reduceNumbers(params)],
	[
		"GTE",
		({ value: a, params }) => {
			return a >= reduceNumbers(params);
		},
	],
	[
		"NGT",
		(opts) => !(({ value: a, params }) => a > reduceNumbers(params))(opts),
	],
	[
		"NGTE",
		(opts) =>
			!(({ value: a, params }) => {
				return a >= reduceNumbers(params);
			})(opts),
	],
	[
		"LEN_GT",
		(opts) =>
			handleLen(opts, ({ value: a, params }) => a > reduceNumbers(params)),
	],
	[
		"LEN_GTE",
		(opts) =>
			handleLen(opts, ({ value: a, params }) => {
				return a >= reduceNumbers(params);
			}),
	],
	[
		"LEN_NGT",
		(opts) =>
			handleLen(
				opts,
				(opts) => !(({ value: a, params }) => a > reduceNumbers(params))(opts),
			),
	],
	[
		"LEN_NGTE",
		(opts) =>
			handleLen(
				opts,
				(opts) =>
					!(({ value: a, params }) => {
						return a >= reduceNumbers(params);
					})(opts),
			),
	],
	["LT", ({ value: a, params }) => a < reduceNumbers(params)],
	[
		"LTE",
		({ value: a, params }) => {
			return a <= reduceNumbers(params);
		},
	],
	[
		"NLT",
		(opts) => !(({ value: a, params }) => a < reduceNumbers(params))(opts),
	],
	[
		"NLTE",
		(opts) =>
			!(({ value: a, params }) => {
				return a <= reduceNumbers(params);
			})(opts),
	],
	[
		"LEN_LT",
		(opts) =>
			handleLen(opts, ({ value: a, params }) => a < reduceNumbers(params)),
	],
	[
		"LEN_LTE",
		(opts) =>
			handleLen(opts, ({ value: a, params }) => {
				return a <= reduceNumbers(params);
			}),
	],
	[
		"LEN_NLT",
		(opts) =>
			handleLen(
				opts,
				(opts) => !(({ value: a, params }) => a < reduceNumbers(params))(opts),
			),
	],
	[
		"LEN_NLTE",
		(opts) =>
			handleLen(
				opts,
				(opts) =>
					!(({ value: a, params }) => {
						return a <= reduceNumbers(params);
					})(opts),
			),
	],
	["EQ", ({ value: a, params: [b] }) => a === b],
	["NEQ", ({ value: a, params: [b] }) => a !== b],
	["LEN_EQ", (opts) => handleLen(opts, ({ value: a, params: [b] }) => a === b)],
	[
		"LEN_NEQ",
		(opts) => handleLen(opts, ({ value: a, params: [b] }) => a !== b),
	],
	[
		"BT",
		(opts) =>
			paramLimiter(
				2,
				opts.params,
				(({ value: a, params }) => a > reduceNumbers(params))({
					...opts,
					params: [opts.params[0]],
				}) &&
					(({ value: a, params }) => a < reduceNumbers(params))({
						...opts,
						params: [opts.params[1]],
					}),
			),
	],
	[
		"NBT",
		(opts) =>
			!((opts) =>
				paramLimiter(
					2,
					opts.params,
					(({ value: a, params }) => a > reduceNumbers(params))({
						...opts,
						params: [opts.params[0]],
					}) &&
						(({ value: a, params }) => a < reduceNumbers(params))({
							...opts,
							params: [opts.params[1]],
						}),
				))(opts),
	],
	[
		"LEN_BT",
		(opts) =>
			handleLen(opts, (opts) =>
				paramLimiter(
					2,
					opts.params,
					(({ value: a, params }) => a > reduceNumbers(params))({
						...opts,
						params: [opts.params[0]],
					}) &&
						(({ value: a, params }) => a < reduceNumbers(params))({
							...opts,
							params: [opts.params[1]],
						}),
				),
			),
	],
	[
		"LEN_NBT",
		(opts) =>
			handleLen(
				opts,
				(opts) =>
					!((opts) =>
						paramLimiter(
							2,
							opts.params,
							(({ value: a, params }) => a > reduceNumbers(params))({
								...opts,
								params: [opts.params[0]],
							}) &&
								(({ value: a, params }) => a < reduceNumbers(params))({
									...opts,
									params: [opts.params[1]],
								}),
						))(opts),
			),
	],
	["IN", ({ value: a, params: [b] }) => arrayify(b).includes(a)],
	[
		"NIN",
		(opts) => {
			return !(({ value: a, params: [b] }) => arrayify(b).includes(a))(opts);
		},
	],
	[
		"LEN_IN",
		(opts) => {
			return handleLen(opts, ({ value: a, params: [b] }) =>
				arrayify(b).includes(a),
			);
		},
	],
	[
		"LEN_NIN",
		(opts) => {
			return handleLen(
				opts,
				(opts) =>
					!(({ value: a, params: [b] }) => arrayify(b).includes(a))(opts),
			);
		},
	],
	["AND", ({ value: a, params: [b] }) => !!a && !!b],
	[
		"OR",
		({ value: a, params }) => {
			if (a) return true;

			for (const p of params) {
				if (p) return true;
			}

			return false;
		},
	],
	[
		"XOR",
		({ value: a, params }) => {
			let has_truthy = !!a;

			for (const p of params) {
				const is_truthy = !!p;

				if (has_truthy === is_truthy) {
					return false;
				}

				if (!has_truthy && is_truthy) {
					has_truthy = true;
				}
			}

			return has_truthy;
		},
	],
	[
		"CUSTOM",
		(opts) => {
			const filtered = opts.params.filter((p) => typeof p === "boolean");
			if (filtered.length === 0) return false;

			// Make sure that all the functions are truthy, escaping early if not
			for (const p of filtered) {
				if (!p) return false;
			}

			return true;
		},
	],
]);

export { FUNCS, getLen };
