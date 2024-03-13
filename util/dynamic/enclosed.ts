import { _s, _sep, bit_of_anything, makeRegex } from "../match/utils/common.ts";
import { arg, asymetricBorderedPart } from "../match/utils/util.ts";

/**
 * Regular expression pattern used to match dynamic strings in a specific format.
 * The dynamic strings are enclosed in double square brackets ([[~ {key} ... ~]]).
 * The format inside the double square brackets follows a specific pattern.
 * This regular expression is used to extract and process the dynamic strings.
 */
const DYN_STR_REGEX = makeRegex(
  [
    "\\[\\[~",
    _s,
    asymetricBorderedPart(["{", "}"], true, "data_key"),
    _s,
    arg("cases", bit_of_anything),
    _s,
    "~\\]\\]",
  ],
  "g",
);

export { DYN_STR_REGEX };
