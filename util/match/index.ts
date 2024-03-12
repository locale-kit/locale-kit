// Parsers
import {
	parseBool,
	parseNum,
	parseStr,
	parseKey,
	parseFn,
	type FunctionObj,
} from "./refs.ts";

// Utils
import { getArgTypes } from "./utils/parse.ts";

// Types
import type { MatchedFunction } from "./fn.ts";
import type { Any } from "./utils/any.ts";

/**
 * Parses the parameters of a string and returns an array of parsed values.
 *
 * @param param - The string containing the parameters to parse.
 * @param ctx - The context object containing the necessary data for parsing.
 * @param fns - The function object containing the necessary functions for parsing.
 * @param key_call_stack - The call stack for tracking nested key parsing.
 * @param max_call_stack - The maximum depth of the call stack for nested key parsing.
 * @returns An array of parsed values.
 */
const parseParams = (
	param: string,
	ctx: Record<string, unknown>,
	fns: FunctionObj,
	key_call_stack: string[] = [],
	max_call_stack = 20,
): Any[] => {
	const out: Any[] = [];
	const params = getArgTypes(param);
	for (let i = 0; i < params.length; i++) {
		const [t, v] = params[i];

		switch (t) {
			case "str":
				out.push(parseStr(v));
				break;
			case "key": {
				if (v.startsWith("p")) {
					const parsed = parseKey(
						v,
						ctx,
						fns,
						key_call_stack,
						max_call_stack,
						true,
					);

					if (Array.isArray(parsed)) {
						out.push(...parsed);
					} else {
						out.push(parsed);
					}
				} else {
					out.push(parseKey(v, ctx, fns, key_call_stack, max_call_stack));
				}
				break;
			}
			case "bool":
				out.push(parseBool(v));
				break;
			case "num":
				out.push(parseNum(v));
				break;
			case "fun":
				out.push(parseFn(v, ctx, fns, key_call_stack, max_call_stack));
				break;
			case "empty":
				out.push(undefined);
				break;
		}
	}

	return out.flat(1);
};

export { parseParams };
