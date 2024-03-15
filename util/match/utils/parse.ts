import { REG_BOOL_LOOSE_STR } from "../reg/bool.reg.ts";
import { REG_FN_LOOSE_STR } from "../reg/fn.reg.ts";
import { REG_KEY_LOOSE_STR } from "../reg/key.reg.ts";
import { REG_NUM_LOOSE_STR } from "../reg/num.reg.ts";
import { REG_STRING_LOOSE_STR } from "../reg/str.reg.ts";
import { _s, _sep, makeRegex } from "./common.ts";
import { capture, orParts } from "./util.ts";

const argument_reg = makeRegex(
	[
		capture(
			...orParts([
				REG_BOOL_LOOSE_STR,
				REG_NUM_LOOSE_STR,
				REG_STRING_LOOSE_STR,
				REG_KEY_LOOSE_STR,
				REG_FN_LOOSE_STR,
			]),
		),
	],
	"g",
);

/**
 * Represents the type of an argument.
 * Possible values are: "num", "str", "fun", "key", "bool", "empty".
 */
type ArgType = "num" | "str" | "fun" | "key" | "bool" | "empty";
type ArgResult = [ArgType, string];

/**
 * Parses a string and returns an array of argument types and the matched string.
 * @param str - The string to parse.
 * @returns An array of argument types.
 */
const getArgTypes = (str: string): ArgResult[] => {
	let args: ArgResult[] = [];

	if (str && typeof str === "string" && str.length > 0) {
		args =
			str.match(argument_reg)?.map((e): ArgResult => {
				let type: ArgType = "empty";
				let value = e;
				switch (e.substring(0, 3)) {
					case "str":
						type = "str";
						break;
					case "key":
					case "pke":
						type = "key";
						break;
					case "boo":
						type = "bool";
						break;
					case "num":
					case "big":
					case "int":
					case "flo":
					case "hex":
						type = "num";
						break;
					case e.startsWith("fn") ? "fn:" : "":
					case "fun":
						type = "fun";
						break;

					default:
						value = "";
						break;
				}
				return [type, value];
			}) || [];
	}

	return args;
};

export { getArgTypes };
export type { ArgResult, ArgType };
