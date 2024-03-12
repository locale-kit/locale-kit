import type { FunctionObj } from "../util/match/refs.ts";
import type { Any } from "../util/match/utils/any.ts";

// deno-lint-ignore-file no-explicit-any
// export type ArgType = number | string;

export type FuncArgsType<T = Any, P = Any[]> = {
	ctx: Record<string, unknown>;
	fns: FunctionObj;
	value: T;
	params: P;
};

export type FuncType<T = Any, P = Any[]> = (opts: FuncArgsType) => boolean;

/**
 * A map of functions, how many args and their types they take, and their names
 */
export interface FUNCSMapType {
	[func_name: string]: FuncType;
}
