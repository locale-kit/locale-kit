import { _sep, formLooseBordered, formStrictForms } from "../utils/common.ts";

const key = "str(?:ing)?";
const loose_forms = formLooseBordered(key);
const strict_forms = formStrictForms(loose_forms);

const REG_STRING_LOOSE_STR = loose_forms.all.join("");

export { REG_STRING_LOOSE_STR, strict_forms as strict_form_str };
