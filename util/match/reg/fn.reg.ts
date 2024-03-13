import {
  _s,
  _sep,
  formLooseBordered,
  formStrictForms,
  strictRegex,
} from "../utils/common.ts";
import {
  arg,
  asymetricBorderedPart,
  borderedpart,
  noCapture,
  optional,
  orParts,
} from "../utils/util.ts";

const key = noCapture("(?:fn)|(?:func(?:tion)?)");

const key_border = ["[", "]"] as [string, string];

const fn_key_part = noCapture(asymetricBorderedPart(key_border));
const fn_arg_part = noCapture(
  ...orParts(
    [
      borderedpart("'"),
      borderedpart("`"),
      borderedpart('"'),
      borderedpart("|"),
      asymetricBorderedPart(["(", ")"]),
      asymetricBorderedPart(["{", "}"]),
    ],
    // false,
  ),
);

const strict_fn_key_part = noCapture(
  asymetricBorderedPart(key_border, true, "key"),
);
const strict_fn_arg_part = arg("arg", optional(fn_arg_part));

const loose_bordered = formLooseBordered(key, [fn_key_part]);

const strict_form_fn = formStrictForms(loose_bordered);

const strict_form_args = strictRegex([
  key,
  _sep,
  strict_fn_key_part,
  strict_fn_arg_part,
]);

const REG_FN_LOOSE_STR = loose_bordered.all.join("");

export { REG_FN_LOOSE_STR, strict_form_args, strict_form_fn };
