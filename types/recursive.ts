/**
 * Represents a recursive object that can contain nested objects of the
 * same type or a whatever T is defined as.
 */
type Recursive<T> = {
	[key: string]: Recursive<T> | T;
};

export type { Recursive };
