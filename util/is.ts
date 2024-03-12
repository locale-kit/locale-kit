export const isString = (value: unknown): boolean => typeof value === "string";
export const isBoolean = (value: unknown): boolean =>
	typeof value === "boolean";
export const isNumber = (value: unknown): boolean => typeof value === "number";
export const isUndefined = (value: unknown): boolean =>
	typeof value === "undefined";
export const isBigInt = (value: unknown): boolean => typeof value === "bigint";
export const isArray = (value: unknown): boolean => Array.isArray(value);
export const isNull = (value: unknown): boolean => value === null;
export const isObject = (value: unknown): boolean =>
	Object.prototype.toString.call(value) === "[object Object]";
