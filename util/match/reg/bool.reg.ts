import { _sep, strictRegex } from "../utils/common.ts";
import { arg, noCapture, orParts } from "../utils/util.ts";

/**
 * Regular expression key for boolean values.
 */
const key = "bool(?:ean)?";

const true_num = "1";
const true_str = "T|t(?:RUE|rue)?";

const false_num = "0";
const false_str = "F|f(?:ALSE|alse)?";

/**
 * The result of matching a boolean value. be it true, false, t, f, 1, or 0 (and their capitalised variants).
 */
const inner = orParts([true_num, true_str, false_num, false_str]);
const base = [key, _sep];

/**
 * Represents a regular expression source for strictly matching a boolean value.
 * Strictyly in this context means it must match from the start to the end of a string
 */
const strict_form = strictRegex([...base, arg("arg", ...inner)]);

/**
 * Regular expression string parts for matching loose boolean values.
 *
 * Loose in this context means it can match anywhere in a string.
 */
const REG_BOOL_LOOSE_STR = [...base, noCapture(...inner)].join("");

export { REG_BOOL_LOOSE_STR, strict_form as strict_form_bool };
