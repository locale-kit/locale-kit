import type { StrictForms } from "./common.ts";

/**
 * The backslash character.
 */
const bs = "\\";

/**
 * Removes escape characters from a string that are used to escape a specific border character.
 *
 * @param source - The input string to unescape.
 * @param border - The border character to unescape.
 * @returns The unescaped string.
 */
function unescapeStringBorder(source: string, border: string): string {
	let str_len = source.length;
	let output = source;

	let i = -1;
	let has_escape = false;
	while (true) {
		/**
		 * Increase the index and check if we've reached the end of the string.
		 */
		if (i++ >= str_len) break;

		/**
		 * Represents a character in the output.
		 */
		const char = output[i];

		if (char === bs) {
			// If the current character is a backslash, and we already have an escape, remove one of them and set the has_escape variable back to false
			if (has_escape) {
				output = output.substring(0, i - 1) + output.substring(i);
				str_len--;
				i--;
				has_escape = false;
				continue;
			}

			// Otherwise, set the has_escape variable to true
			has_escape = true;
			continue;
		}

		if (char === border) {
			// If the current character is the border character, and we have an escape, remove the escape character and keep the border character
			if (has_escape) {
				output = output.substring(0, i - 1) + output.substring(i);
				str_len--;
				i--;
				has_escape = false;
				continue;
			}

			// If we don't have an escape, terminate the loop with the string set to the current index
			output = output.substring(0, i);
			break;
		}

		// If this isn't a backslash or the border character, and if we have an escape, remove the escape character and reset the has_escape variable
		if (has_escape) {
			output = output.substring(0, i - 1) + output.substring(i);
			str_len--;
			i--;
			has_escape = false;
		}

		// Otherwise if we don't have an escape, continue to the next character
	}

	return output.trim();
}

/**
 * Retrieves the bordered argument from a string.
 *
 * @param str - The string to extract the bordered argument from.
 * @param strict - The strict forms object containing regular expressions for different border types.
 * @returns The bordered argument, or an empty string if the argument cannot be extracted.
 */
const getBorderedArgument = (
	str: string,
	strict: StrictForms,
	manual_border?: string,
) => {
	let param_str = str;
	// Make sure a string was passed in
	if (!param_str || typeof param_str !== "string") return "";

	// Trim the string and make sure the result isn't empty
	param_str = str.trim();
	if (param_str === "") return "";

	// Make sure the string matches the pattern
	if (!strict.all.test(param_str)) return "";

	let border = manual_border || "";
	// Check which character is used to enclose the string
	if (border === "") {
		for (let i = 3; i < param_str.length; i++) {
			const char = param_str[i];
			if (char === '"') {
				border = '"';
				break;
			}
			if (char === "'") {
				border = "'";
				break;
			}
			if (char === "`") {
				border = "`";
				break;
			}
			if (char === "|") {
				border = "|";
				break;
			}
			if (char === "(") {
				border = ")";
				break;
			}
			if (char === "{") {
				border = "}";
				break;
			}
			if (char === "[") {
				border = "]";
				break;
			}
		}
	}

	if (border === "") return "";

	let fn: RegExp;
	switch (border) {
		case "`":
			fn = strict.backtick;
			break;
		case "'":
			fn = strict.single_quote;
			break;
		case '"':
			fn = strict.double_quote;
			break;
		case "|":
			fn = strict.pipe;
			break;
		case ")":
			fn = strict.round;
			break;
		case "}":
			fn = strict.curly;
			break;
		case "]":
			fn = strict.square;
			break;
		default:
			return "";
	}

	const match = param_str.match(fn);

	if (match?.groups?.arg === undefined || match?.groups.arg === "") return "";

	return unescapeStringBorder(match?.groups?.arg || "", border);
};

export { getBorderedArgument, unescapeStringBorder };
