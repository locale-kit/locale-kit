import {
	asymetricBorderedPart,
	borderedpart,
	optional,
	orParts,
} from "./util.ts";

/**
 * Represents a collection of loose forms for matching strings.
 * By loose, we mean that they don't have to match from the start to the end of the entire string.
 */
type LooseForms = {
	backtick: string[];
	single_quote: string[];
	double_quote: string[];
	pipe: string[];
	curly: string[];
	round: string[];
	square: string[];
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
	curly: RegExp;
	round: RegExp;
	square: RegExp;
	all: RegExp;
};

/**
 * Regular expression pattern for matching zero or more whitespace characters.
 */
const _s = "\\s*";
/**
 * Separator used in the match utility.
 */
const _sep = `${_s}:${_s}`;

const bit_of_anything = `${orParts([".", "[\\s]"]).join("")}+?`;

const all_border_parts = [
	borderedpart("'"),
	borderedpart("`"),
	borderedpart('"'),
	borderedpart("|"),
	asymetricBorderedPart(["(", ")"]),
	asymetricBorderedPart(["{", "}"]),
	asymetricBorderedPart(["[", "]"]),
];

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
function formLooseBordered(
	key: string,
	parts: string[] = [],
	all_arg_optional = false,
): LooseForms {
	return {
		backtick: [key, _sep, ...parts, borderedpart("`", true)],
		single_quote: [key, _sep, ...parts, borderedpart("'", true)],
		double_quote: [key, _sep, ...parts, borderedpart('"', true)],
		pipe: [key, _sep, ...parts, borderedpart("|", true)],
		curly: [
			key,
			_sep,
			...parts,
			optional(asymetricBorderedPart(["{", "}"], true)),
		],
		round: [
			key,
			_sep,
			...parts,
			optional(asymetricBorderedPart(["(", ")"], true)),
		],
		square: [
			key,
			_sep,
			...parts,
			optional(asymetricBorderedPart(["[", "]"], true)),
		],
		all: [
			key,
			_sep,
			...parts,
			...(all_arg_optional
				? [optional(orParts(all_border_parts, false).join(""))]
				: orParts(all_border_parts, false)),
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
		curly: strictRegex(loose_forms.curly),
		round: strictRegex(loose_forms.round),
		square: strictRegex(loose_forms.square),
		all: strictRegex(loose_forms.all),
	};
}

export {
	_s,
	_sep,
	all_border_parts,
	bit_of_anything,
	formLooseBordered,
	formStrictForms,
	makeRegex,
	strictRegex,
};
export type { LooseForms, StrictForms };
