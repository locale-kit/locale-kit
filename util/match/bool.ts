// Reg
import { strict_form_bool } from "./reg/bool.reg.ts";

// Utils
import { _sep } from "./utils/common.ts";

/**
 * Different errors that can be thrown
 */
const error = {
  input: "Invalid input",
  bool: "Invalid boolean value",
};

/**
 * Parses a string and returns a boolean value based on the string's content.
 * Throws an error if the input is invalid.
 *
 * @param str - The string to parse.
 * @returns The parsed boolean value.
 * @throws {Error} If the input is empty, not a string, or does not match the expected pattern.
 * @throws {Error} If the input is not a valid boolean value.
 */
const parseBool = (str: string) => {
  // Make sure a string was passed in
  if (!str || typeof str !== "string") {
    throw new Error(error.input);
  }

  // Trim the string and make sure the result isn't empty
  const trimmed = str.trim();
  if (trimmed === "") {
    throw new Error(error.input);
  }

  // Make sure the string matches the pattern
  const matched = trimmed.match(strict_form_bool);
  if (!matched?.groups?.arg) {
    throw new Error(error.input);
  }

  const arg = matched.groups.arg;

  const lower_arg = arg.toLowerCase();

  if (lower_arg === "1" || lower_arg.startsWith("t")) return true;
  if (lower_arg === "0" || lower_arg.startsWith("f")) return false;
  throw new Error(error.bool);
};

export { parseBool };
