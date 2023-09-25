export type ArgType = number | string;

export type FuncParamType = "num" | "str" | "key" | "bool" | "fn";

/**
 * A map of functions, how many args and their types they take, and their names
 */
export interface FUNCSMapType {
  [func_name: string]: {
    arg_count: number;
    arg_types: [
      (FuncParamType)[],
      (FuncParamType)[]?,
    ];
    // deno-lint-ignore no-explicit-any
    func: (...args: any) => boolean;
  };
}
