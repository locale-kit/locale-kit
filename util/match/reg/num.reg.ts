import { _sep, strictRegex } from "../utils/common.ts";
import { noCapture, optional, orParts } from "../utils/util.ts";

// A RegExp part that represents the type key type of a number
const key = "(?:(?:num(?:ber)?)|(?:(?:big_)?int(?:eger)?)|(?:float)|(?:hex))";

// const dec = nCap("\\d+", optional(nCap("\\.\\d{1,16}")));
const dec = noCapture("\\d+", optional("\\.\\d{1,16}"));
const hex = noCapture("(?:0x)?[0-9a-fA-F]+");
const inf = "(?:I|i)nf(?:inity|INITY)?";
const nan = "NaN|nan";

const inner = `-?${orParts([hex, inf, nan, dec], false).join("")}`;
const base = [key, _sep];

const strict_form = strictRegex([...base, `(?<arg>${inner})`]);

const REG_NUM_LOOSE_STR = [...base, `(?:${inner})`].join("");

export { REG_NUM_LOOSE_STR, strict_form as strict_form_num };
