import type { Any } from "../types/any.ts";
import type { Recursive } from "../types/recursive.ts";

type FuncArgsType<T = Any, P = Any[], C = Record<string, unknown>> = {
  ctx: C;
  fns: FuncObj;
  value: T;
  params: P;
};

type FuncType<T = Any, P = Any[], C = Record<string, unknown>> = (
  opts: FuncArgsType<T, P, C>,
) => unknown;

type FuncObj = Recursive<FuncType>;

export type { FuncArgsType, FuncObj, FuncType };
