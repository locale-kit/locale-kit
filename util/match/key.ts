// Reg
import { strict_form_key } from "./reg/key.reg.ts";

import type { FuncObj } from "../../types/fn.ts";
// Utils
import { getNestedKeyValue } from "../obj.ts";
import { parseParams } from "./refs.ts";
import { getBorderedArgument } from "./utils/border.ts";
import { _sep } from "./utils/common.ts";
import { handleCallStack, handleCircularRef } from "./utils/util.ts";

/**
 * Parses the given key string and retrieves the corresponding value from the context object.
 * @param str - The key string to parse.
 * @param ctx - The context object containing the key-value pairs.
 * @returns The value corresponding to the parsed key string from the context object.
 */
const parseKey = ({
	str,
	ctx,
	fns,
	value = undefined,
	key_call_stack,
	max_call_stack,
	parse_val = false,
}: {
	str: string;
	ctx: Record<string, unknown>;
	fns: FuncObj;
	value?: unknown;
	key_call_stack: string[];
	max_call_stack: number;
	parse_val?: boolean;
}): unknown | unknown[] => {
	handleCallStack(key_call_stack, max_call_stack);

	const arg = getBorderedArgument(str, strict_form_key);
	handleCircularRef(key_call_stack, arg);

	const val = getNestedKeyValue(ctx, arg);

	if (val !== undefined && typeof val === "string" && parse_val) {
		return parseParams({
			param: val,
			ctx,
			fns,
			value,
			key_call_stack: [...key_call_stack, arg],
			max_call_stack,
		});
	}

	return val;
};

export { parseKey };
