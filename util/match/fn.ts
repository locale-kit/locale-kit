import { getNestedKeyValue } from "../obj.ts";
// Parsers
import { parseParams } from "./refs.ts";

// Reg
import { strict_form_args, strict_form_fn } from "./reg/fn.reg.ts";

import { getBorderedArgument } from "./utils/border.ts";
// Utils
import { _s, _sep } from "./utils/common.ts";
import { handleCallStack, handleCircularRef } from "./utils/util.ts";

import type { FuncObj, FuncType } from "../../types/fn.ts";
// Types
import type { ArgResult } from "./utils/parse.ts";

/**
 * Parses a string and executes a corresponding function based on the parsed result.
 *
 * @param str - The string to parse.
 * @param ctx - The context object.
 * @param fns - The function object. {@link FuncObj}
 * @param i - How far down the recursion is. Defaults to 0.
 * @returns The result of executing the corresponding function.
 */
const parseFn = ({
	str,
	ctx,
	fns,
	value = undefined,
	key_call_stack,
	max_call_stack,
}: {
	str: string;
	ctx: Record<string, unknown>;
	fns: FuncObj;
	value?: unknown;
	key_call_stack: string[];
	max_call_stack: number;
}): unknown => {
	handleCallStack(key_call_stack, max_call_stack);
	let param_str = str;
	// Make sure a string was passed in
	if (!param_str || typeof param_str !== "string") return undefined;

	// Trim the string and make sure the result isn't empty
	param_str = str.trim();
	if (param_str === undefined) return undefined;

	// Make sure the string matches the pattern
	if (!strict_form_fn.all.test(param_str)) return void 0;
	const matched = param_str.match(strict_form_args);
	if (!matched?.groups?.key) return undefined;

	const key = matched.groups.key.substring(1, matched.groups.key.length - 1);
	const params = matched.groups.arg?.trim() || undefined;

	// Handle circular references
	const fn = getNestedKeyValue(fns, key) as FuncType | undefined;
	if (typeof fn !== "function") return undefined;
	handleCircularRef(key_call_stack, `fn.${key}`);

	let args: ArgResult[] = [];

	// if (arg && typeof arg === "string" && arg.length > 0) {
	const arg_content = getBorderedArgument(
		param_str,
		strict_form_fn,
		params && params.length > 0 ? params[params.length - 1] : undefined,
	);

	if (arg_content.length > 0) {
		args = parseParams({
			param: arg_content,
			ctx,
			fns,
			key_call_stack: [...key_call_stack],
			value,
		});
	}

	return fn({
		ctx,
		fns,
		value,
		params: args,
	});
};

export { parseFn };
