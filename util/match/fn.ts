// Parsers
import { parseParams } from "./refs.ts";
import { getNestedKeyValue } from "../obj.ts";

// Reg
import { strict_form_args, strict_form_fn } from "./reg/fn.reg.ts";

// Utils
import { _sep, _s, getBorderedArgument } from "./utils/common.ts";
import { handleCallStack, handleCircularRef } from "./utils/util.ts";

// Types
import type { ArgResult } from "./utils/parse.ts";
import type { Any } from "./utils/any.ts";

/**
 * Represents the arguments for a function call.
 *
 * @template A - The type of the arguments.
 */
type Args<A> = {
	ctx: Record<string, unknown>;
	fns: FunctionObj;
	args: A;
};

/**
 * Represents a matched function to be called. The function takes an {@link Args} object and returns whatever the function does
 *
 * @template A - The type of the function arguments.
 */
type MatchedFunction<A = Any[]> = (opts: Args<A>) => unknown;

/**
 * Represents a recursive object that can contain nested objects of the same type or a {@link MatchedFunction}.
 */
type Recursive<T> = {
	[key: string]: Recursive<T> | MatchedFunction;
};

/**
 * Represents an object that contains functions matching a specific pattern.
 */
type FunctionObj = Recursive<MatchedFunction>;

/**
 * Parses a string and executes a corresponding function based on the parsed result.
 *
 * @param str - The string to parse.
 * @param ctx - The context object.
 * @param fns - The function object. {@link FunctionObj}
 * @param i - How far down the recursion is. Defaults to 0.
 * @returns The result of executing the corresponding function.
 */
const parseFn = (
	str: string,
	ctx: Record<string, unknown>,
	fns: FunctionObj,
	key_call_stack: string[],
	max_call_stack: number,
) => {
	handleCallStack(key_call_stack, max_call_stack);
	// Make sure a string was passed in
	if (!str || typeof str !== "string") return "";

	// Trim the string and make sure the result isn't empty
	const trimmed = str.trim();
	if (trimmed === "") return "";

	// Make sure the string matches the pattern
	if (!strict_form_fn.all.test(trimmed)) return void 0;
	const matched = trimmed.match(strict_form_args);
	if (!matched?.groups?.key) return "";

	const key = matched.groups.key;
	// const arg = matched.groups.arg;

	// Handle circular references
	const fn = getNestedKeyValue(fns, key);
	if (typeof fn !== "function") return "";
	handleCircularRef(key_call_stack, `fn.${key}`);

	let args: ArgResult[] = [];

	// if (arg && typeof arg === "string" && arg.length > 0) {
	const arg_content = getBorderedArgument(trimmed, strict_form_fn);

	if (arg_content.length > 0) {
		args = parseParams(arg_content, ctx, fns, [...key_call_stack]);
	}

	return fn({
		ctx,
		fns,
		args,
	});
};

export { parseFn };
export type { MatchedFunction, FunctionObj };
