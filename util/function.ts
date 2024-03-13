import type { FuncArgsType, FuncType } from "../types/fn.ts";
import { isArray, isBigInt, isNumber, isObject, isString } from "./is.ts";

const MAXSAFEINT = BigInt(Number.MAX_SAFE_INTEGER);

const getLen = (arg: unknown): number => {
	switch (true) {
		case isString(arg):
		case isArray(arg):
			return (arg as string).length;
		case isObject(arg):
			return Object.keys(arg as object).length;
		case isNumber(arg):
			return arg as number;
		case isBigInt(arg): {
			const big_int = arg as bigint;
			if (big_int < MAXSAFEINT) return Number(big_int);
			return Number.NaN;
		}
		default:
			return Number.NaN;
	}
};

const reduceNumbers = (params: unknown[]): number =>
	(params.filter((e) => typeof e === "number") as number[]).reduce(
		(acc, cur) => acc + cur,
		0,
	);

const paramLimiter = (
	limit: number,
	params: unknown[],
	val: unknown,
): boolean => (params.length !== limit ? false : !!val);

const funcGT: FuncType<number, number[]> = ({ value: a, params }) =>
	a > reduceNumbers(params);
const funcGTE: FuncType<number, number[]> = ({ value: a, params }) => {
	return a >= reduceNumbers(params);
};
const funcNGT: FuncType<number, number[]> = (opts) => !funcGT(opts);
const funcNGTE: FuncType<number, number[]> = (opts) => !funcGTE(opts);
const funcLT: FuncType<number, number[]> = ({ value: a, params }) =>
	a < reduceNumbers(params);
const funcLTE: FuncType<number, number[]> = ({ value: a, params }) => {
	return a <= reduceNumbers(params);
};
const funcNLT: FuncType<number, number[]> = (opts) => !funcLT(opts);
const funcNLTE: FuncType<number, number[]> = (opts) => !funcLTE(opts);
const funcEQ: FuncType = ({ value: a, params: [b] }) => a === b;
const funcNEQ: FuncType = ({ value: a, params: [b] }) => a !== b;
const funcAND: FuncType = ({ value: a, params: [b] }) => !!a && !!b;
const funcBT: FuncType<number, number[]> = (opts) =>
	paramLimiter(
		2,
		opts.params,
		funcGT({ ...opts, params: [opts.params[0]] }) &&
			funcLT({ ...opts, params: [opts.params[1]] }),
	);

const funcNBT: FuncType<number, number[]> = (opts) => !funcBT(opts);
const funcIN: FuncType = ({ value: a, params: [b] }) =>
	(isArray(b)
		? b
		: isString(b)
		  ? b.split(" ")
		  : isObject(b)
			  ? Object.keys(b)
			  : []
	).includes(a);
const funcNIN: FuncType = (opts) => !funcIN(opts);
const funcOR: FuncType = ({ value: a, params }) => {
	if (a) return true;

	for (const p of params) {
		if (p) return true;
	}

	return false;
};
const funcXOR: FuncType = ({ value: a, params }) => {
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
};

const handleLen = (opts: FuncArgsType, fn: FuncType) => {
	const val_len = getLen(opts.value);

	if (Number.isNaN(val_len)) return false;
	return fn({ ...opts, value: val_len });
};

const funcLEN_GT: FuncType = (opts) => handleLen(opts, funcGT);
const funcLEN_GTE: FuncType = (opts) => handleLen(opts, funcGTE);
const funcLEN_NGT: FuncType = (opts) => handleLen(opts, funcNGT);
const funcLEN_NGTE: FuncType = (opts) => handleLen(opts, funcNGTE);
const funcLEN_LT: FuncType = (opts) => handleLen(opts, funcLT);
const funcLEN_LTE: FuncType = (opts) => handleLen(opts, funcLTE);
const funcLEN_NLT: FuncType = (opts) => handleLen(opts, funcNLT);
const funcLEN_NLTE: FuncType = (opts) => handleLen(opts, funcNLTE);
const funcLEN_EQ: FuncType = (opts) => handleLen(opts, funcEQ);
const funcLEN_NEQ: FuncType = (opts) => handleLen(opts, funcNEQ);
const funcLEN_BT: FuncType = (opts) => handleLen(opts, funcBT);
const funcLEN_NBT: FuncType = (opts) => handleLen(opts, funcNBT);
const funcLEN_IN: FuncType = (opts) => handleLen(opts, funcIN);
const funcLEN_NIN: FuncType = (opts) => handleLen(opts, funcNIN);
const funcCUSTOM: FuncType = (opts) => {
	const filtered = opts.params.filter((p) => typeof p === "boolean");
	if (filtered.length === 0) return false;

	// Make sure that all the functions are truthy, escaping early if not
	for (const p of filtered) {
		if (!p) return false;
	}

	return true;
};

const FUNCS: Map<string, FuncType<number, number[]>> = new Map([
	["GT", funcGT],
	["GTE", funcGTE],
	["NGT", funcNGT],
	["NGTE", funcNGTE],
	["LEN_GT", funcLEN_GT],
	["LEN_GTE", funcLEN_GTE],
	["LEN_NGT", funcLEN_NGT],
	["LEN_NGTE", funcLEN_NGTE],
	["LT", funcLT],
	["LTE", funcLTE],
	["NLT", funcNLT],
	["NLTE", funcNLTE],
	["LEN_LT", funcLEN_LT],
	["LEN_LTE", funcLEN_LTE],
	["LEN_NLT", funcLEN_NLT],
	["LEN_NLTE", funcLEN_NLTE],
	["EQ", funcEQ],
	["NEQ", funcNEQ],
	["LEN_EQ", funcLEN_EQ],
	["LEN_NEQ", funcLEN_NEQ],
	["BT", funcBT],
	["NBT", funcNBT],
	["LEN_BT", funcLEN_BT],
	["LEN_NBT", funcLEN_NBT],
	["IN", funcIN],
	["NIN", funcNIN],
	["LEN_IN", funcLEN_IN],
	["LEN_NIN", funcLEN_NIN],
	["AND", funcAND],
	["OR", funcOR],
	["XOR", funcXOR],
	["CUSTOM", funcCUSTOM],
]);

export { FUNCS };
