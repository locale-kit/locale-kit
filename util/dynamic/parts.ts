import { _sep, makeRegex } from "../match/utils/common.ts";
import {
	orParts,
	borderedpart,
	arg,
	asymetricBorderedPart,
	optional,
	noCapture,
} from "../match/utils/util.ts";

const nc = noCapture;

const len = optional("LEN_");
const not = optional("N", false);
const eq = optional("E", false);

// Creates a regex pattern part for a given key and options
/**
 * Creates a regex pattern part for a given key and options
 *
 * @param opts - Specific options to include in the pattern
 * @param key - The key to create
 * @returns The formatted key.
 */
const formatKey = (
	opts: Partial<{
		len: boolean;
		not: boolean;
		eq: boolean;
	}>,
	key: string,
) => {
	const { len: inc_len = true, not: inc_not = true, eq: inc_eq = true } = opts;
	const out = [];

	if (inc_len) out.push(len);
	if (inc_not) out.push(not);
	out.push(key);
	if (inc_eq) out.push(eq);
	return out.join("");
};

// Pattern part for the function parameters
const params = optional(
	asymetricBorderedPart(["(", ")"], true, "params"),
	false,
);

// Pattern part for the case keys (.e.g. GT, LT, EQ, etc.)
const keys = arg("case_key", "[\\w\\d-]+");

// Pattern part for the content enclosed in quotes, backticks, pipes, square braces, or squiggly brackets
const content_reg = arg(
	"content",
	...orParts(
		[
			borderedpart('"'),
			borderedpart("`"),
			borderedpart("'"),
			borderedpart("|"),
			asymetricBorderedPart(["{", "}"]),
			asymetricBorderedPart(["[", "]"]),
		],
		false,
	),
);

/**
 * Regular expression pattern used to match dynamic case keys in a specific format.
 * The pattern captures the case key, parameters and the corresponding content.
 *
 * The pattern matches the following format:
 * - The case key: a combination of alphanumeric characters, hyphens, and certain keywords.
 * - The parameters: a list of parameters enclosed in parentheses.
 * - The content: enclosed in one of the following: backticks (`), quotes ("), single quotes ('), or pipes (|), or between curly braces ({}) or square brackets ([]).
 *
 * | Length Functions | Regular Functions |
 * | ---------------- | ----------------- |
 * | LEN_GT           | GT                |
 * | LEN_GTE          | GTE               |
 * | LEN_NGT          | NGT               |
 * | LEN_NGTE         | NGTE              |
 * | LEN_LT           | LT                |
 * | LEN_LTE          | LTE               |
 * | LEN_NLT          | NLT               |
 * | LEN_NLTE         | NLTE              |
 * | LEN_EQ           | EQ                |
 * | LEN_NEQ          | NEQ               |
 * | LEN_BT           | BT                |
 * | LEN_NBT          | NBT               |
 * | LEN_IN           | IN                |
 * | LEN_NIN          | NIN               |
 * | LEN_OR           | OR                |
 * | LEN_XOR          | XOR               |
 * | LEN_AND          | AND               |
 * | LEN_CUSTOM       | CUSTOM            |
 */
export const DYN_CASEKEY_REGEX = makeRegex(
	[nc(keys, params, _sep, content_reg)],
	"gs",
);
