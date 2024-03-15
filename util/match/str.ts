// Reg
import { strict_form_str } from "./reg/str.reg.ts";

import { getBorderedArgument } from "./utils/border.ts";
// Utils
import { _sep } from "./utils/common.ts";

/**
 * Parses a string and returns the bordered argument using the `getBorderedArgument` function.
 *
 * @param str - The string to parse.
 * @returns The bordered argument obtained from the input string.
 */
const parseStr = (str: string) => {
	return getBorderedArgument(str, strict_form_str);
};

export { parseStr };
