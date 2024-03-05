import { FunctionType } from "../types/fn.ts";
import type { ArgType, FUNCSMapType } from "../types/format.ts";
import { FuncParamType } from "../types/format.ts";
import { getNestedKeyValue } from "./obj.ts";

/**
 * Regex to get the 1 (or 2) arguments of a function
 */
const DYN_ARG_REGEX =
	/(?<arg1>(?:str\s*:\s*\`(?<arg1_val_str>[^`]*)\`)|(?:key\s*:\s*(?:{\s*(?<arg1_val_key>[^{}]*?)\s*}))|(?:fn\s*:\s*(?:{\s*(?<arg1_val_fn>[^{}]*?)\s*}))|(?:num\s*:\s*(?<arg1_val_num>[0-9]+(\.[0-9]+)?))|(?:bool\s*:\s*(?<arg1_val_bool>true|false|1|0)))(?:\s*,\s*(?<arg2>(?:str\s*:\s*\`(?<arg2_val_str>[^`]*)\`)|(?:key\s*:\s*(?:{(?<arg2_val_key>.*?)}))|(?:fn\s*:\s*(?:{(?<arg2_val_fn>.*?)}))|(?:num\s*:\s*(?<arg2_val_num>[0-9]+(\.[0-9]+)?))|(?:bool\s*:\s*(?<arg2_val_bool>true|false|1|0))))?/s;

const getLen = (a: ArgType): ArgType => {
	if (typeof a === "string" || Array.isArray(a)) {
		return a.length;
	}
	if (typeof a === "object") {
		return Object.keys(a).length;
	}
	return Number.NaN;
};

const funcGT = (a: ArgType, b: ArgType) => a > b;
const funcGTE = (a: ArgType, b: ArgType) => a >= b;
const funcNGT = (a: ArgType, b: ArgType) => !funcGT(a, b);
const funcNGTE = (a: ArgType, b: ArgType) => !funcGTE(a, b);
const funcLT = (a: ArgType, b: ArgType) => a < b;
const funcLTE = (a: ArgType, b: ArgType) => a <= b;
const funcNLT = (a: ArgType, b: ArgType) => !funcLT(a, b);
const funcNLTE = (a: ArgType, b: ArgType) => !funcLTE(a, b);
const funcEQ = (a: ArgType | boolean, b: ArgType | boolean) => a === b;
const funcNEQ = (a: ArgType | boolean, b: ArgType | boolean) => a !== b;
const funcAND = (a: boolean, b: boolean) => !!a && !!b;
const funcBT = (a: ArgType, b: ArgType, c: ArgType) =>
	funcGT(a, b) && funcLT(a, c);
const funcNBT = (a: ArgType, b: ArgType, c: ArgType) => !funcBT(a, b, c);
const funcIN = (a: ArgType, b: ArgType[] | string) => b.includes(a as string);
const funcNIN = (a: ArgType, b: ArgType[] | string) => !funcIN(a, b);
const funcOR = (a: boolean, b: boolean) => !!a || !!b;
const funcXOR = (a: boolean, b: boolean) => funcNEQ(!!a, !!b);

const funcLEN_GT = (a: ArgType, b: ArgType) => getLen(a) > b;
const funcLEN_GTE = (a: ArgType, b: ArgType) => getLen(a) >= b;
const funcLEN_NGT = (a: ArgType, b: ArgType) => !funcGT(getLen(a), b);
const funcLEN_NGTE = (a: ArgType, b: ArgType) => !funcGTE(getLen(a), b);
const funcLEN_LT = (a: ArgType, b: ArgType) => getLen(a) < b;
const funcLEN_LTE = (a: ArgType, b: ArgType) => getLen(a) <= b;
const funcLEN_NLT = (a: ArgType, b: ArgType) => !funcLT(getLen(a), b);
const funcLEN_NLTE = (a: ArgType, b: ArgType) => !funcLTE(getLen(a), b);
const funcLEN_EQ = (a: ArgType | boolean, b: ArgType | boolean) =>
	getLen(a as ArgType) === b;
const funcLEN_NEQ = (a: ArgType | boolean, b: ArgType | boolean) =>
	getLen(a as ArgType) !== b;
const funcLEN_BT = (a: ArgType, b: ArgType, c: ArgType) =>
	funcGT(getLen(a), b) && funcLT(getLen(a), c);
const funcLEN_NBT = (a: ArgType, b: ArgType, c: ArgType) =>
	!funcBT(getLen(a), b, c);
const funcLEN_IN = (a: ArgType, b: ArgType[] | string) =>
	b.includes(getLen(a) as string);
const funcLEN_NIN = (a: ArgType, b: ArgType[] | string) =>
	!funcIN(getLen(a), b);
const funcCUSTOM = (a: ArgType, fn: (a: ArgType) => boolean) => fn(a);

export const FUNCS: FUNCSMapType = {
	// GT functions
	GT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcGT,
	},
	GTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcGTE,
	},
	NGT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcNGT,
	},
	NGTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcNGTE,
	},
	LEN_GT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_GT,
	},
	LEN_GTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_GTE,
	},
	LEN_NGT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_NGT,
	},
	LEN_NGTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_NGTE,
	},

	LT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLT,
	},
	LTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLTE,
	},
	NLT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcNLT,
	},
	NLTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcNLTE,
	},
	LEN_LT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_LT,
	},
	LEN_LTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_LTE,
	},
	LEN_NLT: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_NLT,
	},
	LEN_NLTE: {
		arg_count: 1,
		arg_types: [["num", "str", "key"]],
		func: funcLEN_NLTE,
	},

	EQ: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcEQ,
	},
	NEQ: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcNEQ,
	},
	LEN_EQ: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcLEN_EQ,
	},
	LEN_NEQ: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcLEN_NEQ,
	},

	BT: {
		arg_count: 2,
		arg_types: [
			["num", "str", "key"],
			["num", "str", "key"],
		],
		func: funcBT,
	},
	NBT: {
		arg_count: 2,
		arg_types: [
			["num", "str", "key"],
			["num", "str", "key"],
		],
		func: funcNBT,
	},
	LEN_BT: {
		arg_count: 2,
		arg_types: [
			["num", "str", "key"],
			["num", "str", "key"],
		],
		func: funcLEN_BT,
	},
	LEN_NBT: {
		arg_count: 2,
		arg_types: [
			["num", "str", "key"],
			["num", "str", "key"],
		],
		func: funcLEN_NBT,
	},

	IN: {
		arg_count: 1,
		arg_types: [["key"]],
		func: funcIN,
	},
	NIN: {
		arg_count: 1,
		arg_types: [["key"]],
		func: funcNIN,
	},
	LEN_IN: {
		arg_count: 1,
		arg_types: [["key"]],
		func: funcLEN_IN,
	},
	LEN_NIN: {
		arg_count: 1,
		arg_types: [["key"]],
		func: funcLEN_NIN,
	},

	AND: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcAND,
	},
	OR: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcOR,
	},
	XOR: {
		arg_count: 1,
		arg_types: [["num", "str", "key", "bool"]],
		func: funcXOR,
	},
	CUSTOM: {
		arg_count: 1,
		arg_types: [["fn"]],
		func: funcCUSTOM,
	},
};
export const FUNC_NAMES = Object.keys(FUNCS);

/**
 * Retrieves the parameters from a string representation of a function call.
 *
 * @template T - The type of the data object.
 * @param str - The string representation of the function call.
 * @param data - The data object used for resolving key arguments.
 * @param functions - The functions object used for resolving function arguments.
 * @returns An array of function parameters, including their values and types.
 * @example
 */
export function getFunctionParameters<T extends Record<string, unknown>>(
	str: string,
	data: Record<string, unknown> = {},
	functions?: Record<string, unknown>,
): (
	| {
			val:
				| string
				| number
				| boolean
				| FunctionType<T>
				| ((a: unknown) => boolean);
			type: FuncParamType;
	  }
	| undefined
)[] {
	const ctx = data || {};
	const fns = functions || {};
	// Execute the regex to get the arguments from the string
	const {
		arg1,
		arg1_val_str,
		arg1_val_key,
		arg1_val_fn,
		arg1_val_num,
		arg1_val_bool,
		arg2,
		arg2_val_str,
		arg2_val_key,
		arg2_val_fn,
		arg2_val_num,
		arg2_val_bool,
	} = (DYN_ARG_REGEX.exec(str) || { groups: {} }).groups as Partial<{
		arg1: string;
		arg1_val_str: string;
		arg1_val_key: string;
		arg1_val_fn: string;
		arg1_val_num: string;
		arg1_val_bool: string;
		arg2: string;
		arg2_val_str: string;
		arg2_val_key: string;
		arg2_val_fn: string;
		arg2_val_num: string;
		arg2_val_bool: string;
	}>;

	const args: (
		| {
				val:
					| string
					| number
					| boolean
					| FunctionType<T>
					| ((a: unknown) => boolean);
				type: FuncParamType;
		  }
		| undefined
	)[] = [];

	if (arg1) {
		const type = arg1.split(":")[0] as FuncParamType;
		let arg: string | number | boolean | FunctionType<T> | undefined =
			undefined;

		// handle the different types of arguments
		if (type === "str" && arg1_val_str !== undefined) {
			arg = arg1_val_str;
		} else if (type === "key" && arg1_val_key !== undefined) {
			arg = getNestedKeyValue(ctx, arg1_val_key as string) as
				| string
				| number
				| boolean
				| undefined;
		} else if (type === "num" && arg1_val_num !== undefined) {
			const tmp_num = arg1_val_num.includes(".")
				? Number.parseFloat(arg1_val_num as string)
				: Number.parseInt(arg1_val_num as string);

			// If the argument isn't a valid number, discard it
			if (Number.isNaN(tmp_num)) {
				arg = undefined;
			} else {
				arg = tmp_num;
			}
		} else if (type === "bool" && arg1_val_bool !== undefined) {
			switch (arg1_val_bool) {
				case "true":
				case "1":
					arg = true;
					break;
				case "false":
				case "0":
					arg = false;
					break;
				default:
					arg = undefined;
					break;
			}
		} else if (type === "fn" && arg1_val_fn !== undefined) {
			arg = getNestedKeyValue(fns, arg1_val_fn as string) as FunctionType<T>;
		}

		args.push(arg !== undefined ? { val: arg, type } : undefined);
	}

	// If the function requires a second (really third if you count
	// the comparison passed in at the beginning of the dynamic
	// replacer) argument, parse it from the provided ar2 variables
	// from the regex
	if (arg2) {
		const type = arg2.split(":")[0] as FuncParamType;
		let arg: string | number | boolean | FunctionType<T> | undefined =
			undefined;

		// handle the different types of arguments
		if (type === "str" && arg2_val_str !== undefined) {
			arg = arg2_val_str;
		} else if (type === "key" && arg2_val_key !== undefined) {
			arg = getNestedKeyValue(ctx, arg2_val_key as string) as
				| string
				| number
				| boolean
				| undefined;
		} else if (type === "num" && arg2_val_num !== undefined) {
			arg = arg2_val_num.includes(".")
				? Number.parseFloat(arg2_val_num as string)
				: Number.parseInt(arg2_val_num as string);
			// If the argument isn't a valid number, discard it
			if (Number.isNaN(arg)) {
				arg = undefined;
			}
		} else if (type === "bool" && arg2_val_bool !== undefined) {
			switch (arg2_val_bool) {
				case "true":
				case "1":
					arg = true;
					break;
				case "false":
				case "0":
					arg = false;
					break;
				default:
					arg = undefined;
					break;
			}
		} else if (type === "fn" && arg2_val_fn !== undefined) {
			arg = getNestedKeyValue(fns, arg2_val_fn as string) as FunctionType<T>;
		}

		args.push(arg ? { val: arg, type } : undefined);
	}

	return args;
}
