import { formStrictForms, _sep, formLooseBordered } from "../utils/common.ts";
const key = "(p)?key";

const loose_forms = formLooseBordered(key);
const strict_forms = formStrictForms(loose_forms);

const REG_KEY_LOOSE_STR = loose_forms.all.join("");

export { strict_forms as strict_form_key, REG_KEY_LOOSE_STR };
