export type FunctionType<
	T extends Record<string, unknown> = Record<string, unknown>,
	A = unknown[],
> = (ops: { params: A; ctx: T; matched: string }) => unknown;
