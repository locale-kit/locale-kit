import { orParts, borderedpart, asymetricBorderedPart } from "./util.ts";

/**
 * Represents a collection of loose forms for matching strings.
 * By loose, we mean that they don't have to match from the start to the end of the entire string.
 */
type LooseForms = {
	backtick: string[];
	single_quote: string[];
	double_quote: string[];
	pipe: string[];
	all: string[];
};

/**
 * Represents a collection of regular expressions used for strict form matching.
 * By strict, we mean that the entire string must match the regular expression.
 */
type StrictForms = {
	backtick: RegExp;
	single_quote: RegExp;
	double_quote: RegExp;
	pipe: RegExp;
	all: RegExp;
};

/**
 * The backslash character.
 */
const bs = "\\";
/**
 * Returns the floor value of half of the given number.
 *
 * @param int - The number to calculate half floor value for.
 * @returns The floor value of half of the given number.
 */
const halfFloor = (int: number) => Math.floor(int * 0.5);
/**
 * Repeats the a string of backslashes a specified number of times.
 *
 * @param count - The number of times to repeat the string.
 * @returns The repeated string.
 */
const repeatBS = (count: number) => bs.repeat(count);

/**
 * Regular expression pattern for matching zero or more whitespace characters.
 */
const _s = "\\s*";
/**
 * Separator used in the match utility.
 */
const _sep = `${_s}:${_s}`;

const bit_of_anything = `${orParts([".", "[\\s]"]).join("")}+?`;

/**
 * Creates a regular expression from an array of string parts.
 *
 * @param parts - An array of string parts to be joined into a regular expression.
 * @param opts - Optional flags for the regular expression.
 * @returns A regular expression object.
 */
const makeRegex = (parts: string[], opts?: string) =>
	new RegExp(parts.join(""), opts);

/**
 * Creates a strict regular expression by concatenating the given parts with "^" at the beginning and "$" at the end.
 * @param parts - An array of strings representing the parts of the regular expression.
 * @param opts - Optional flags for the regular expression.
 * @returns A regular expression object.
 */
function strictRegex(parts: string[], opts?: string): RegExp {
	return makeRegex(["^", ...parts, "$"], opts);
}

/**
 * Forms a loose bordered object of RegExps with different forms of the given key and parts.
 * @param key - The key to be used in the forms.
 * @param parts - An array of additional parts to be included in the forms. Defaults to an empty array.
 * @returns A `LooseForms` object containing different forms of the key and parts.
 * @see {@link LooseForms}
 */
function formLooseBordered(key: string, parts: string[] = []): LooseForms {
	return {
		backtick: [key, _sep, ...parts, borderedpart("`", true)],
		single_quote: [key, _sep, ...parts, borderedpart("'", true)],
		double_quote: [key, _sep, ...parts, borderedpart('"', true)],
		pipe: [key, _sep, ...parts, borderedpart("|", true)],
		all: [
			key,
			_sep,
			...parts,
			...orParts(
				[
					borderedpart("'"),
					borderedpart("`"),
					borderedpart('"'),
					borderedpart("|"),
				],
				false,
			),
		],
	};
}

/**
 * Converts a set of loose forms into strict form RegExps by using the {@link strictRegex} function to add entire string matching.
 * @param loose_forms - The loose forms to convert.
 * @returns The strict forms.
 * @see {@link StrictForms}
 */
function formStrictForms(loose_forms: LooseForms): StrictForms {
	return {
		backtick: strictRegex(loose_forms.backtick),
		single_quote: strictRegex(loose_forms.single_quote),
		double_quote: strictRegex(loose_forms.double_quote),
		pipe: strictRegex(loose_forms.pipe),
		all: strictRegex(loose_forms.all),
	};
}

/**
 * Removes escape characters from a string that are used to escape a specific border character.
 *
 * @param source - The input string to unescape.
 * @param border - The border character to unescape.
 * @returns The unescaped string.
 */
function unescapeStringBorder(source: string, border: string): string {
	let str_len = source.length;
	let escape_char_index = -1;
	let output = source;

	let i = -1;
	while (true) {
		if (i++ >= str_len) break;

		const char = output[i];

		if (char === bs) {
			// If we're at the end of the string and the escape character index is set,
			// remove half of the backslashes. This can only be even due to the regex used
			// before this function is called, so we don't need to worry about maybe letting
			// a border character remain or not
			if (i === str_len - 1 && escape_char_index !== -1) {
				const half_count = halfFloor(i + 1 - escape_char_index);

				output =
					output.substring(0, escape_char_index) +
					repeatBS(half_count) +
					output.substring(i + 1);
				break;
			}

			if (escape_char_index === -1) {
				// If the current character is a backslash, and the escape character index
				// is not set, set it to the current index
				escape_char_index = i;
			}

			continue;
		}

		if (char === border) {
			// If the index of the first backslash and now is odd, remove half of the
			// backslashes (rounding down) and keep the border character
			// We'll need to change the current index to the end of the affected area,
			// and change the str_len to the new length of the string which we can do by
			// just subtracting the number of characters removed from the total length
			// instead of recalculating the length of the string
			if (escape_char_index !== -1) {
				const count = i - escape_char_index;
				const half_count = halfFloor(count);
				const is_even = count % 2 === 0 ? 1 : 0;
				const c = is_even + 1;

				output =
					output.substring(0, escape_char_index) +
					repeatBS(half_count) +
					output.substring(i + is_even);

				i -= count - half_count + c;
				str_len -= count - half_count + c;
				escape_char_index = -1;
			}
		}

		if (escape_char_index !== -1) {
			escape_char_index = -1;
		}
	}

	return output;
}

/**
 * Retrieves the bordered argument from a string.
 *
 * @param str - The string to extract the bordered argument from.
 * @param strict - The strict forms object containing regular expressions for different border types.
 * @returns The bordered argument, or an empty string if the argument cannot be extracted.
 */
const getBorderedArgument = (str: string, strict: StrictForms) => {
	// Make sure a string was passed in
	if (!str || typeof str !== "string") return "";

	// Trim the string and make sure the result isn't empty
	const trimmed = str.trim();
	if (trimmed === "") return "";

	// Make sure the string matches the pattern
	if (!strict.all.test(trimmed)) return "";

	let border = "";
	// Check which character is used to enclose the string
	for (let i = 3; i < trimmed.length; i++) {
		const char = trimmed[i];
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
		default:
			return "";
	}

	const match = trimmed.match(fn);

	if (!match?.groups?.arg) return "";

	return unescapeStringBorder(match.groups.arg, border);
};

export {
	_s,
	_sep,
	bit_of_anything,
	makeRegex,
	strictRegex,
	formLooseBordered,
	formStrictForms,
	getBorderedArgument,
};
export type { LooseForms, StrictForms };
