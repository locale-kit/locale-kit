import type { Any } from "../types/any.ts";
import type { FuncArgsType, FuncType } from "../types/fn.ts";
import { getLen } from "./getLen.ts";
import { isArray, isMap, isObject, isString, isTruthy } from "./is.ts";

export const MAXSAFEINT = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Reduces an array of values to the sum of all numbers in the array.
 *
 * @param params - An array of values.
 * @returns The sum of all numbers in the array.
 */
const addNumbers = (params: unknown[]): number =>
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
): boolean => (params.length !== limit ? false : isTruthy(val));

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
	["GT", ({ value: a, params }) => a > addNumbers(params)],
	[
		"GTE",
		({ value: a, params }) => {
			return a >= addNumbers(params);
		},
	],
	["NGT", (opts) => !(({ value: a, params }) => a > addNumbers(params))(opts)],
	[
		"NGTE",
		(opts) =>
			!(({ value: a, params }) => {
				return a >= addNumbers(params);
			})(opts),
	],
	[
		"LEN_GT",
		(opts) => handleLen(opts, ({ value: a, params }) => a > addNumbers(params)),
	],
	[
		"LEN_GTE",
		(opts) =>
			handleLen(opts, ({ value: a, params }) => {
				return a >= addNumbers(params);
			}),
	],
	[
		"LEN_NGT",
		(opts) =>
			handleLen(
				opts,
				(opts) => !(({ value: a, params }) => a > addNumbers(params))(opts),
			),
	],
	[
		"LEN_NGTE",
		(opts) =>
			handleLen(
				opts,
				(opts) =>
					!(({ value: a, params }) => {
						return a >= addNumbers(params);
					})(opts),
			),
	],
	["LT", ({ value: a, params }) => a < addNumbers(params)],
	[
		"LTE",
		({ value: a, params }) => {
			return a <= addNumbers(params);
		},
	],
	["NLT", (opts) => !(({ value: a, params }) => a < addNumbers(params))(opts)],
	[
		"NLTE",
		(opts) =>
			!(({ value: a, params }) => {
				return a <= addNumbers(params);
			})(opts),
	],
	[
		"LEN_LT",
		(opts) => handleLen(opts, ({ value: a, params }) => a < addNumbers(params)),
	],
	[
		"LEN_LTE",
		(opts) =>
			handleLen(opts, ({ value: a, params }) => {
				return a <= addNumbers(params);
			}),
	],
	[
		"LEN_NLT",
		(opts) =>
			handleLen(
				opts,
				(opts) => !(({ value: a, params }) => a < addNumbers(params))(opts),
			),
	],
	[
		"LEN_NLTE",
		(opts) =>
			handleLen(
				opts,
				(opts) =>
					!(({ value: a, params }) => {
						return a <= addNumbers(params);
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
		({ value, params }) =>
			paramLimiter(2, params, value > params[0] && value < params[1]),
	],
	[
		"NBT",
		({ value, params }) =>
			!paramLimiter(2, params, value > params[0] && value < params[1]),
	],
	[
		"LEN_BT",
		(opts) =>
			handleLen(opts, ({ params, value }) =>
				paramLimiter(2, params, value > params[0] && value < params[1]),
			),
	],
	[
		"LEN_NBT",
		(opts) =>
			handleLen(
				opts,
				({ params, value }) =>
					!paramLimiter(2, params, value > params[0] && value < params[1]),
			),
	],
	["IN", ({ value: a, params: [b] }) => arrayify(b).includes(a)],
	["NIN", ({ value: a, params: [b] }) => !arrayify(b).includes(a)],
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
				({ value: a, params: [b] }) => !arrayify(b).includes(a),
			);
		},
	],
	[
		"AND",
		({ value: a, params: p }) => {
			if (!isTruthy(a)) return false;

			return p.every(isTruthy);
		},
	],
	[
		"OR",
		({ value: a, params }) => {
			if (isTruthy(a)) return true;

			return params.some(isTruthy);
		},
	],
	[
		"XOR",
		({ value: a, params }) => {
			let has_truthy = isTruthy(a);

			for (const p of params) {
				const is_truthy = isTruthy(p);

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
			// const filtered = opts.params.filter((p) => typeof p === "boolean");
			if (opts.params.length === 0) return false;

			// Make sure that all the values are truthy
			return opts.params.every(isTruthy);
		},
	],
]);

export { FUNCS, getLen };
