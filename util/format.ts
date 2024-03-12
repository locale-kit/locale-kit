import { FUNCS } from "./function.ts";

import { getNestedKeyValue } from "./obj.ts";

import { DYN_CASEKEY_REGEX } from "./dynamic/parts.ts";
import { DYN_STR_REGEX } from "./dynamic/enclosed.ts";

import { parseParams } from "./match/refs.ts";
import { _sep, bit_of_anything, makeRegex } from "./match/utils/common.ts";
import { arg, optional } from "./match/utils/util.ts";

import type { FunctionObj } from "./match/refs.ts";
import type { FuncType } from "../types/format.ts";

/**
 * Regular expression pattern used to match dynamic nested arguments in a string. These get joined together with .join('')
 *
 * The pattern matches the following format: `{{...args}}` or `{{...args}}||default||`.
 * - `...args` represents the dynamic any privded functions.
 * - `default` (optional) represents the default value to be used if any of the following cases are true:
 *   	- The arguments list is empty
 *   	- The arguments list is filled with all undefined values
 *
 * @remarks
 * This regular expression is used in the formatting utility of the locale kit.
 */
const DYN_NESTED_REGEX = makeRegex(
	[
		"{{",
		optional(arg("args", bit_of_anything), false),
		"}}",
		optional(
			[
				"\\|\\|",
				optional(arg("fallback", bit_of_anything), false),
				"\\|\\|",
			].join(""),
		),
	],
	"g",
);

// console.log(DYN_CASEKEY_REGEX.source);

// /**
//  * Regular expression pattern used to match dynamic nested function placeholders.
//  *
//  * The pattern matches the following format:
//  *   - `{{{ func: `value` }}}` where `func` is the function name and `value` is the value enclosed in backticks (`).
//  *   - `{{{ nested.func: ;:value:; }}}` where `func` is the function name and `value` is the value enclosed in a
//  *  		semicolon colon sandwhich (;:content:;).
//  *
//  * @remarks
//  * - The `func` group captures the function name.
//  * - The `val_a` group captures the value enclosed in backticks (`).
//  * - The `val_b` group captures the value enclosed in a semicolon colon sandwhich (;:content:;).
//  */
// const DYN_NESTED_FUNC_REGEX =
// 	/\{\{\{\s*(?<func>[^\{\}\:\;]+):\s*(?:(?:`(?<val_a>[^`]*)`)|(?:;:(?<val_b>(?:(?!:;).)*):;))\s*\}\}\}/gs;

/**
 * Formats a string by replacing dynamic placeholders with corresponding values from the provided data object.
 *
 * @template T - The type of the data object.
 * @param str - The string to be formatted.
 * @param data - The data object containing values for dynamic placeholders.
 * @param functions - An optional object containing custom functions for dynamic comparisons.
 * @returns The formatted string.
 */
export function format<T extends Record<string, unknown>>(
	str = "",
	data?: T,
	functions: FunctionObj = {},
): string {
	const ctx = data || ({} as T);

	// Find anything matching something similar to [[~ {object.nested.key} 1: `string` | 2: `{{object.second.nested.key}} string` | 3: `string` | ... | default: `string` ]]
	// and replace it with the correct string depending on the value of the object.nested.key
	const translated = str.replaceAll(
		DYN_STR_REGEX,
		(
			match_src,
			data_key_src,
			cases_src,
			// matched_str: string,
			// _key: string,
			// _dyn_field: string,
			// _case_key: string,
			// _unk,
			// _src_str: string,
			// groups: { data_key: string; case_key: string; cases: string },
		) => {
			const match = match_src as string;
			const data_key = data_key_src as string;
			const cases = cases_src as string;

			// Get the value from the context object
			const cur_val = getNestedKeyValue(ctx, data_key);

			// collect all the options into an array
			const options = cases.matchAll(DYN_CASEKEY_REGEX);
			// const options_arr = Array.from(options);
			// const options_default =
			// 	options_arr.find(([_src, opt_key]) => {
			// 		return opt_key === "default";
			// 	}) || [];

			// console.log({ options_default });

			// Build an options map from the regex result iterable
			const options_map = new Map<string, string>();

			// If the value is undefined and there's a default, return the default
			if (cur_val === undefined && false) {
				return options_map.get("default") as string;
			}

			if (cur_val === undefined) {
				return "[fallback_key_missing]";
			}

			let func_case_val: string | undefined = undefined;

			for (const [_src, opt_key, opt_params, opt_content] of options) {
				if (opt_key === "default") {
					options_map.set(opt_key, opt_content);
					continue;
				}
				// Handle running comparison functions on provided values
				// If there's already a value, skip all future iterations
				if (func_case_val !== undefined) continue;

				// Make sure the function exists
				let fn: FuncType<unknown, unknown[]>;
				if (FUNCS.has(opt_key)) {
					fn = FUNCS.get(opt_key) as FuncType;
				} else {
					options_map.set(opt_key, opt_content);
					continue;
				}

				// Fetch the function parameters
				const parsed_params = parseParams(opt_params || "", ctx, functions);
				const is_truthy = fn({
					value: cur_val,
					fns: functions,
					params: parsed_params,
					ctx: ctx,
				});

				// If the result is true, set the value of this key to the
				// external func_case_val variable for further use
				if (is_truthy === true) {
					func_case_val = opt_content;
					break;
				}
			}

			// If one of the functions above returned true, return the value of the case that matched
			if (func_case_val !== undefined) {
				return func_case_val;
			}

			// Cast the value to a string in case people are using numbers
			const val_str = new String(cur_val).toString();

			// If the current value is not in the options, use the default
			if (options_map.has(val_str as string)) {
				return options_map.get(val_str as string) as string;
			}

			console.log(options_map, val_str);

			return "[fallback_key_missing]";
		},
	);

	// Proceed to replace any instances of {{object.nested.key}} (optionally formatted with a fallback string as {{}}||fallback string|| ) with their appropriate values
	// Additionally, handle any nested functions that are called in the string
	let i = 0;
	let formatted = translated;
	while (true) {
		// Make sure we don't try to iterate too many times
		if (i > 30) {
			break;
		}
		i++;

		if (!DYN_NESTED_REGEX.test(formatted)) {
			break;
		}

		formatted = formatted.replaceAll(
			DYN_NESTED_REGEX,
			(_match, key, fallback) => {
				const a = parseParams(key, ctx, functions);

				console.log({ a });
				const val = getNestedKeyValue(ctx, key);
				if (val === undefined) {
					return fallback || "[no_value]";
				}

				return val as string;
			},
		);
	}

	return formatted;
	// return "";
}
// [[~
// 	{test}
// 	GTE(num: 1): "aaa"
// ~]]
console.log(
	format(
		`[[~
			{test}
			LEN_LTE(
				pkey: "formed_args.add_1",
				fn: [returnArr]||
			): "Booper" |
			default: "Bop"
		~]]`,
		{
			test: 6,
			formed_args: {
				add_1: `pkey: "formed_args.add_2"`,
				add_2: `num: 5"`,
			},
		},
		{
			returnArr: () => [1, 2, 3],
		},
	),
);

// ,
// {
// 	formed_args: {
// 		add_1: `pkey: "formed_args.add_2"`,
// 		add_2: `num: 5"`,
// 	},
// },
// {
// 	utils: {
// 		add,
// 	},
// },
