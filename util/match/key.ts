// Reg
import { strict_form_key } from "./reg/key.reg.ts";

// Utils
import { getNestedKeyValue } from "../obj.ts";
import { getBorderedArgument, _sep } from "./utils/common.ts";
import { parseParams, type FunctionObj } from "./refs.ts";
import { handleCircularRef } from "./utils/util.ts";
import { handleCallStack } from "./utils/util.ts";

// import {} from './refs.ts';

/**
 * Parses the given key string and retrieves the corresponding value from the context object.
 * @param str - The key string to parse.
 * @param ctx - The context object containing the key-value pairs.
 * @returns The value corresponding to the parsed key string from the context object.
 */
const parseKey = (
	str: string,
	ctx: Record<string, unknown>,
	fns: FunctionObj,
	key_call_stack: string[],
	max_call_stack: number,
	parse_val = false,
): unknown | unknown[] => {
	handleCallStack(key_call_stack, max_call_stack);

	const arg = getBorderedArgument(str, strict_form_key);
	handleCircularRef(key_call_stack, arg);

	const val = getNestedKeyValue(ctx, arg);

	if (val !== undefined && typeof val === "string" && parse_val)
		return parseParams(val, ctx, fns, [...key_call_stack, arg], max_call_stack);
};

export { parseKey };
