// Reg
import { strict_form_num } from "./reg/num.reg.ts";

// Utils
import { _sep } from "./utils/common.ts";

/**
 * Represents a NaN value.
 */
const nan = Number.NaN;

/**
 * Parses a string and converts it to a number based on its format.
 * @param str - The string to parse.
 * @returns The parsed number, or NaN if the string cannot be parsed.
 */
const parseNum = (str: string) => {
  // Make sure a string was passed in
  if (!str || typeof str !== "string") return nan;

  // Trim the string and make sure the result isn't empty
  const trimmed = str.trim();
  if (trimmed === "") return nan;

  // Make sure the string matches the pattern
  const matched = trimmed.match(strict_form_num);
  if (!matched?.groups?.arg) return nan;

  const arg = matched.groups.arg;
  const lower_arg = arg.toLowerCase();

  // Check if the number is infinity
  // We'll do this here as not all the other data types support infinity (i.e. Bigint)
  let is_inf = lower_arg.startsWith("inf");
  let inf = Number.POSITIVE_INFINITY;
  if (lower_arg.startsWith("-inf")) {
    is_inf = true;
    inf = Number.NEGATIVE_INFINITY;
  }

  // Check if they want NaN explicitly
  if (lower_arg === "nan") return nan;

  switch (trimmed[0]) {
    // Number and float
    case "n":
    case "f": {
      if (is_inf) return inf;
      return Number.parseFloat(arg);
    }
    // Integer
    case "i": {
      if (is_inf) return inf;
      return Number.parseInt(arg);
    }
    // Bigint
    case "b": {
      if (is_inf) return nan;

      return BigInt(arg);
    }
    // Hex
    case "h": {
      if (is_inf) return inf;
      return Number.parseInt(arg.startsWith("0x") ? arg : `0x${arg}`, 16);
    }
  }
};

export { parseNum };
