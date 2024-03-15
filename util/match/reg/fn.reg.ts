import { all_border_parts } from "../utils/common.ts";
import {
	_s,
	_sep,
	formLooseBordered,
	formStrictForms,
	strictRegex,
} from "../utils/common.ts";
import { arg, noCapture, optional, orParts } from "../utils/util.ts";

/**
 * Regular expression pattern for matching the keywords "fn", "func", or "function".
 */
const key = noCapture("(?:fn)|(?:func(?:tion)?)");

const fn_key_part = noCapture(...orParts(all_border_parts));
const fn_arg_part = noCapture(...orParts(all_border_parts));

const strict_fn_key_part = arg("key", fn_key_part);
const strict_fn_arg_part = optional(arg("arg", fn_arg_part));

const loose_bordered = formLooseBordered(key, [fn_key_part], true);

const strict_form_fn = formStrictForms(loose_bordered);

const strict_form_args = strictRegex([
	key,
	_sep,
	strict_fn_key_part,
	strict_fn_arg_part,
]);
const REG_FN_LOOSE_STR = loose_bordered.all.join("");

export { REG_FN_LOOSE_STR, strict_form_args, strict_form_fn };
