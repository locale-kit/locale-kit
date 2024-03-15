import { MAXSAFEINT } from "./function.ts";
import { isArray, isBigInt, isNumber, isObject, isString } from "./is.ts";

/**
 * Calculates the length of the given argument.
 *
 * @param arg - The argument to calculate the length of.
 * @returns The length of the argument.
 */
export function getLen(arg: unknown): number {
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
}
