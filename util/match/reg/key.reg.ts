import { _sep, formLooseBordered, formStrictForms } from "../utils/common.ts";
const key = "(p)?key";

const loose_forms = formLooseBordered(key);
const strict_forms = formStrictForms(loose_forms);

const REG_KEY_LOOSE_STR = loose_forms.all.join("");

export { REG_KEY_LOOSE_STR, strict_forms as strict_form_key };
