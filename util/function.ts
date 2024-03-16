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
 * Converts the input value to an array based on its type.
 *
 * @param b - The input value to be converted to an array.
 * @returns An array representation of the input value.
 */
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

const FN_LEN = (opts: FuncArgsType, fn: FuncType) => {
	const val_len = getLen(opts.value);

	if (Number.isNaN(val_len)) return false;
	return fn({ ...opts, value: val_len });
};

// Greater than
const FN_GT: FuncType<number, number[]> = ({ value: a, params: p }) =>
	a > addNumbers(p);
const FN_GTE: FuncType<number, number[]> = ({ value: a, params: p }) =>
	a >= addNumbers(p);
const FN_NGT: FuncType<number, number[]> = (opts) => !FN_GT(opts);
const FN_NGTE: FuncType<number, number[]> = (opts) => !FN_GTE(opts);
// Less than
const FN_LT: FuncType<number, number[]> = FN_NGTE;
const FN_LTE: FuncType<number, number[]> = ({ value: a, params: p }) =>
	a <= addNumbers(p);
const FN_NLT: FuncType<number, number[]> = FN_GTE;
const FN_NLTE: FuncType<number, number[]> = FN_GT;
// Equal
const FN_EQ: FuncType<Any, Any[]> = ({ value: a, params: [b] }) => a === b;
const FN_NEQ: FuncType<Any, Any[]> = ({ value: a, params: [b] }) => a !== b;
// Between
const FN_BT: FuncType<Any, Any[]> = ({ value: a, params: p }) =>
	a > p[0] && a < p[1];
const FN_BTE: FuncType<Any, Any[]> = ({ value: a, params: p }) =>
	a >= p[0] && a <= p[1];
const FN_NBT: FuncType<Any, Any[]> = (opts) => !FN_BT(opts);
const FN_NBTE: FuncType<Any, Any[]> = (opts) => !FN_BTE(opts);
// Contained in
const FN_IN: FuncType<Any, Any[]> = ({ value: a, params: [b] }) =>
	arrayify(b).includes(a);
const FN_NIN: FuncType<Any, Any[]> = (opts) => !FN_IN(opts);
// All truthy
const FN_AND: FuncType<Any, Any[]> = ({ value: a, params: p }) =>
	isTruthy(a) && p.every(isTruthy);
// Any truthy
const FN_OR: FuncType<Any, Any[]> = ({ value: a, params: p }) =>
	isTruthy(a) || p.some(isTruthy);
// Only one truthy
const FN_XOR: FuncType<Any, Any[]> = ({ value: a, params: pa }) => {
	let has_truthy = isTruthy(a);

	for (const p of pa) {
		const is_truthy = isTruthy(p);

		if (has_truthy === is_truthy) return false;

		if (!has_truthy && is_truthy) {
			has_truthy = true;
		}
	}

	return has_truthy;
};
// Custom (all truthy)
const FN_CUSTOM: FuncType<Any, Any[]> = (opts) => {
	// const filtered = opts.params.filter((p) => typeof p === "boolean");
	if (opts.params.length === 0) return false;

	// Make sure that all the values are truthy
	return opts.params.every(isTruthy);
};

// Key length variants
const FN_LEN__GT: FuncType<Any, Any[]> = (opts) => FN_LEN(opts, FN_GT);
const FN_LEN__GTE: FuncType<Any, Any[]> = (opts) => FN_LEN(opts, FN_GTE);
const FN_LEN__NGT: FuncType<Any, Any[]> = (opts) => !FN_LEN__GT(opts);
const FN_LEN__NGTE: FuncType<Any, Any[]> = (opts) => !FN_LEN__GTE(opts);
const FN_LEN__LT: FuncType<Any, Any[]> = (opts) => !FN_LEN__GTE(opts);
const FN_LEN__LTE: FuncType<Any, Any[]> = (opts) => !FN_LEN__GT(opts);
const FN_LEN__NLT: FuncType<Any, Any[]> = (opts) => FN_LEN__GTE(opts);
const FN_LEN__NLTE: FuncType<Any, Any[]> = (opts) => FN_LEN__GT(opts);
const FN_LEN__EQ: FuncType<Any, Any[]> = (opts) => FN_LEN(opts, FN_EQ);
const FN_LEN__NEQ: FuncType<Any, Any[]> = (opts) => !FN_LEN__EQ(opts);
const FN_LEN__BT: FuncType<Any, Any[]> = (opts) => FN_LEN(opts, FN_BT);
const FN_LEN__BTE: FuncType<Any, Any[]> = (opts) => FN_LEN(opts, FN_BTE);
const FN_LEN__NBT: FuncType<Any, Any[]> = (opts) => !FN_LEN__BT(opts);
const FN_LEN__NBTE: FuncType<Any, Any[]> = (opts) => !FN_LEN__BTE(opts);
const FN_LEN__IN: FuncType<Any, Any[]> = (opts) => FN_LEN(opts, FN_IN);
const FN_LEN__NIN: FuncType<Any, Any[]> = (opts) => !FN_LEN__IN(opts);

/**
 * Map of functions with their corresponding names and implementations.
 * The key is the function name and the value is the function implementation.
 */
const FUNCS: Map<string, FuncType<Any, Any[]>> = new Map([
	["GT", FN_GT],
	["GTE", FN_GTE],
	["NGT", FN_NGT],
	["NGTE", FN_NGTE],
	["LEN_GT", FN_LEN__GT],
	["LEN_GTE", FN_LEN__GTE],
	["LEN_NGT", FN_LEN__NGT],
	["LEN_NGTE", FN_LEN__NGTE],
	["LT", FN_LT],
	["LTE", FN_LTE],
	["NLT", FN_NLT],
	["NLTE", FN_NLTE],
	["LEN_LT", FN_LEN__LT],
	["LEN_LTE", FN_LEN__LTE],
	["LEN_NLT", FN_LEN__NLT],
	["LEN_NLTE", FN_LEN__NLTE],
	["EQ", FN_EQ],
	["NEQ", FN_NEQ],
	["LEN_EQ", FN_LEN__EQ],
	["LEN_NEQ", FN_LEN__NEQ],
	["BT", FN_BT],
	["BTE", FN_BTE],
	["NBT", FN_NBT],
	["NBTE", FN_NBTE],
	["LEN_BT", FN_LEN__BT],
	["LEN_BTE", FN_LEN__BTE],
	["LEN_NBT", FN_LEN__NBT],
	["LEN_NBTE", FN_LEN__NBTE],
	["IN", FN_IN],
	["NIN", FN_NIN],
	["LEN_IN", FN_LEN__IN],
	["LEN_NIN", FN_LEN__NIN],
	["AND", FN_AND],
	["OR", FN_OR],
	["XOR", FN_XOR],
	["CUSTOM", FN_CUSTOM],
]);

export { FUNCS, getLen };
