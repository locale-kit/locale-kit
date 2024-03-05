// deno-lint-ignore-file no-explicit-any
export type ArgType = number | string;

export type FuncParamType = "num" | "str" | "key" | "bool" | "fn";

/**
 * A map of functions, how many args and their types they take, and their names
 */
export interface FUNCSMapType {
	[func_name: string]: {
		arg_count: number;
		arg_types: [FuncParamType[], FuncParamType[]?];
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		func: (...args: any[]) => boolean;
	};
}
