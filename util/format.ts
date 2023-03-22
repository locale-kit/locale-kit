import { getNestedKeyValue } from "./obj.ts";
import { FUNC_NAMES, FUNCS, getFunctionParameters } from "./function.ts";

const DYN_STR_REGEX =
  /\[\[~\s*(?:{(?<data_key>.*?)})\s*(?<cases>(?:\s*(?<case_key>(?:(?:[\w-])|(?:N?GTE?|N?LTE?|N?EQ|AND|N?BT|N?IN|X?OR)\((?:[^)]+)\))+)\s*:\s*(?:(?:`[^`]*`)|(?:;:(?:(?!:;).)*:;))\s*\|*\s*)+)+\]\]/gs;
const DYN_CASEKEY_REGEX =
  /(?<case_key>(?:(?:[\w-])|(?:N?GTE?|N?LTE?|N?EQ|AND|N?BT|N?IN|X?OR)\((?:[^)]+)\))+)\s*:\s*(?:(?:`(?<content_a>[^`]*)`)|(?:;:(?<content_b>(?:(?!:;).)*):;))/gs;

/**
 * Function for handling
 */
const DYN_FUNC_REGEX =
  /(?<func>N?GTE?|N?LTE?|N?EQ|AND|N?BT|N?IN|X?OR)\((?<args>[^)]+)\)/s;

/**
 * Regex for inner content replacement
 */
const DYN_NESTED_REGEX = /\{\{(.*?)\}\}(?:\|\|(.*?)\|\|)?/gs;

export function format(str: string = '', opts: Record<string, unknown> = {}) {
  // Find anything matching something similar to [[~ {object.nested.key} 1: `string` | 2: `{{object.second.nested.key}} string` | 3: `string` | ... | default: `string` ]]
  // and replace it with the correct string depending on the value of the object.nested.key
  const translated = str.replaceAll(
    DYN_STR_REGEX,
    (
      _matched_str: string,
      _key: string,
      _dyn_field: string,
      _case_key: string,
      _unk,
      _src_str: string,
      groups: { data_key: string; case_key: string; cases: string },
    ) => {
      let cur_val = getNestedKeyValue(opts, groups["data_key"]);

      if (cur_val === undefined) {
        cur_val = "default";
      }

      // collect all the options into an array
      // const options = dyn_field.matchAll(DYN_CASEKEY_REGEX);
      const options = groups.cases.matchAll(DYN_CASEKEY_REGEX);

      // Build an options map from the regex result iterable
      const options_map = new Map<string, string>();
      for (const option of options) {
        options_map.set(
          option.groups?.case_key as string,
          (option.groups?.content_a || option.groups?.content_b) as string,
        );
      }

      // Handle running comparison functions on provided values
      let func_case_val: string | undefined = undefined;
      options_map.forEach((val, key) => {
        // If there's already a value, skip all future iterations
        if (func_case_val !== undefined) return;
        // If the key matches DYN_FUNC_REGEX, run it and if it returns true, set the value to func_case_val
        if (DYN_FUNC_REGEX.test(key)) {
          // Get the separated function name
          const func_name = key.substring(0, key.indexOf("(")).toUpperCase();
          // Get the arguments and split them by commas, then trim the whitespace

          // Make sure the function exists
          if (!FUNC_NAMES.includes(func_name)) {
            return;
          }

          const [arg1_obj, arg2_obj] = getFunctionParameters(key, opts);
          const arg1 = arg1_obj?.val;
          const arg2 = arg2_obj?.val;
          const arg1_type = arg1_obj?.type;
          const arg2_type = arg2_obj?.type;

          // Get the function object to make sure the argument lengths meet the minimum for the function
          const func_obj = FUNCS[func_name as keyof typeof FUNCS];
          if (
            (func_obj.arg_count === 1 && arg1 === undefined) ||
            (func_obj.arg_count === 2 && arg2 === undefined)
          ) {
            return;
          }

          // Get the available types for each function variable
          const [arg1_valid_types, arg2_valid_types = []] = func_obj.arg_types;

          // Make sure the type of the above variables match with whats allowed in the func_obj.arg_types array
          if (!arg1_type || !arg1_valid_types.includes(arg1_type)) {
            // Exit out early if the type for the second variable is invalid
            return;
          }

          // Make sure the types of arg 2 are valid as well, or if the function only needs one argument, set it to true
          if (
            func_obj.arg_count !== 1 &&
            (!arg2_type || !arg2_valid_types.includes(arg2_type))
          ) {
            // Exit out early if the type for the second variable is invalid
            return;
          }

          // If the types are valid, run the function
          const result =
            (func_obj.func as (a: string, b: string, c: string) => boolean)(
              cur_val as string,
              arg1 as string,
              arg2 as string,
            );

          // If the result is true, set the value of this key to the
          // external func_case_val variable for further use
          if (result === true) {
            func_case_val = val;
            return;
          } else {
            return;
          }
        }
      });

      // If one of the functions above returned true, return the value of the case that matched
      if (func_case_val !== undefined) {
        return func_case_val;
      }

      // Cast the value to a string in case people are using numbers
      const val_str = new String(cur_val).toString();
      // If the current value is not in the options, use the default
      if (options_map.has(val_str as string)) {
        return options_map.get(val_str as string) as string;
      } else if (options_map.has("default")) {
        return options_map.get("default") as string;
      } else {
        return "[fallback_key_missing]";
      }
    },
  );

  // Proceed to replace any instances of {{object.nested.key}} (optionally formatted with a fallback string as {{}}||fallback string|| )  with their appropriate values
  const formatted = translated.replaceAll(
    DYN_NESTED_REGEX,
    (_match, key, fallback) => {
      const val = getNestedKeyValue(opts, key);
      if (val === undefined) {
        return fallback || "[no_value]";
      }

      return val as string;
    },
  );

  return formatted;
}
