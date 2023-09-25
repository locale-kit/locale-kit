export type FunctionType<
  T extends Record<string, unknown> = Record<string, unknown>,
> = (
  val: unknown,
  ctx: T,
  matched: string,
) => unknown;
