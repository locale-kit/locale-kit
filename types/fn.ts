import type { Any } from "../types/any.ts";
import type { Recursive } from "../types/recursive.ts";

/**
 * Represents the type for the arguments of a function.
 *
 * @template T - The type of the value.
 * @template P - The type of the parameters passed to the function.
 * @template C - The type of the context - an object.
 */
type FuncArgsType<T = Any, P = Any[], C = Record<string, unknown>> = {
	/**
	 * An object containing any relavent context for the function being called. This is
	 * passed in by the user in the translate or format functions.
	 */
	ctx: C;
	/**
	 * The functions that have been passed in for use by the user/overarching system.
	 * The fucntion these parameters are part of should be contained within this object,
	 * and can access any other function in this object.
	 */
	fns: FuncObj;
	/**
	 * This is defined only in cases where there's a dynamic string matcher being used.
	 */
	value: T;
	/**
	 * The parameters passed to the function.
	 * These are pre-parsed by the parseParams function found in util/match/index.ts
	 */
	params: P;
};

/**
 * Represents a function type with optional generic parameters.
 *
 * @template T - The return type of the function.
 * @template P - The parameter types of the function as an array.
 * @template C - The context type of the function as a record.
 */
type FuncType<T = Any, P = Any[], C = Record<string, unknown>> = (
	opts: FuncArgsType<T, P, C>,
) => Any;

/**
 * Represents a potentially depply nested object of functions.
 * @template FuncType - The type of the function.
 */
type FuncObj = Recursive<FuncType>;

export type { FuncArgsType, FuncObj, FuncType };
