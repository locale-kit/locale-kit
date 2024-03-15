const esc = (char: string) =>
	char === "|" || char === "[" || char === "]" || char === "(" || char === ")"
		? `\\${char}`
		: char;

/**
 * Creates a regular expression pattern that matches any of the provided parts.
 *
 * @param parts - The parts to be included in the regular expression pattern.
 * @returns A regular expression pattern that matches any of the provided parts.
 */
const orParts = (parts: string[], bordered = true) => {
	const out = ["(?:"];
	const len = parts.length - 1;
	parts.reduce((acc, part, i) => {
		acc.push(bordered ? noCapture(part) : part);
		if (i !== len) acc.push("|");
		return acc;
	}, out);
	out.push(")");

	return out;
};

/**
 * Creates a regular expression pattern for capturing named groups.
 *
 * @param key - The name of the named group.
 * @param parts - The parts to be joined together to form the pattern.
 * @returns A regular expression pattern with a named group.
 */
const arg = (key: string, ...parts: string[]) =>
	`(?<${key}>(?:${parts.join("")}))`;

/**
 * Creates a non-capturing group regular expression pattern.
 *
 * @param args - The strings to be concatenated into a non-capturing group pattern.
 * @returns A non-capturing group regular expression pattern.
 */
const noCapture = (...args: string[]) => `(?:${args.join("")})`;

/**
 * Creates a capture group pattern by concatenating the provided strings.
 *
 * @param args - The strings to be concatenated.
 * @returns A string representing the capture group pattern.
 */
const capture = (...args: string[]) => `(${args.join("")})`;

const noIncludeBefore = (str: string) => `(?<=${str})`;
const noIncludeAfter = (str: string) => `(?=${str})`;

/**
 * Generates a regular expression pattern for matching an bordered part with asymetrical borders. (e.g. `{` and `}`)
 * @param start The starting border string.
 * @param end The ending border string.
 * @param is_arg Optional boolean argument.
 * @param key Optional key string.
 * @returns The generated regular expression pattern.
 */
const asymetricBorderedPart = (
	[open, close]: [string, string],
	is_arg = false,
	key = "arg",
	include_border = true,
) => {
	const open_esc = esc(open);
	const close_esc = open === close ? open_esc : esc(close);

	const border_start = include_border ? open_esc : noIncludeBefore(open_esc);
	const border_end = include_border ? close_esc : noIncludeAfter(close_esc);
	const inner = [...orParts([`[^${close_esc}\\\\]`, "\\\\."]), "*"].join("");

	return `${border_start}${is_arg ? arg(key, inner) : inner}${border_end}`;
};

/**
 * Returns a regex to match a string that is surrounded by the given border.
 *
 * @param border - The border to surround the part with.
 * @param arg - Optional argument.
 * @param key - Optional key.
 * @returns The part of the string surrounded by the border.
 */
const borderedpart = (
	border: string,
	arg = false,
	key = "arg",
	include_border = true,
) => {
	return asymetricBorderedPart([border, border], arg, key, include_border);
};

/**
 * Creates an optional string pattern.
 *
 * @param str - The string pattern.
 * @param wrapped - Indicates whether the pattern should be wrapped in a non-capturing group.
 * @returns The optional string pattern.
 */
const optional = (str: string, wrapped = true) => {
	if (wrapped) {
		return `${noCapture(str)}?`;
	}

	return `${str}?`;
};

/**
 * Handles the call stack by checking if the maximum call stack limit has been reached.
 *
 * @param key_call_stack - The array representing the call stack.
 * @param max_call_stack - The maximum number of calls allowed in the call stack.
 * @throws {Error} If the maximum call stack limit has been reached.
 */
const handleCallStack = (key_call_stack: string[], max_call_stack: number) => {
	if (key_call_stack.length >= max_call_stack) {
		throw new Error(`Max call stack reached at ${key_call_stack.join(" -> ")}`);
	}
};

/**
 * Handles circular references in the key call stack.
 * @param key_call_stack - The array representing the call stack of keys.
 * @param key - The key to be checked for circular reference.
 * @throws {Error} If a circular reference is detected.
 */
const handleCircularRef = (key_call_stack: string[], key: string) => {
	if (key_call_stack.includes(key)) {
		throw new Error(
			`Circular reference detected in key "${key}" at ${key_call_stack.join(
				" -> ",
			)}`,
		);
	}

	// Otherwise, add the call to the stack
	key_call_stack.push(key);
};

export {
	arg,
	asymetricBorderedPart,
	borderedpart,
	capture,
	handleCallStack,
	handleCircularRef,
	noCapture,
	optional,
	orParts,
};
