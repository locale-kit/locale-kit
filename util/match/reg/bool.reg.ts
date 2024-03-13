import { _sep, strictRegex } from "../utils/common.ts";
import { arg, noCapture, orParts } from "../utils/util.ts";

// A RegExp part that represents the type key type of a number
const key = "bool(?:ean)?";

const true_num = "1";
const true_str = "T|t(?:RUE|rue)?";

const false_num = "0";
const false_str = "F|f(?:ALSE|alse)?";

const inner = orParts([true_num, true_str, false_num, false_str]);
const base = [key, _sep];

const strict_form = strictRegex([...base, arg("arg", ...inner)]);

const REG_BOOL_LOOSE_STR = [...base, noCapture(...inner)].join("");

export { REG_BOOL_LOOSE_STR, strict_form as strict_form_bool };
