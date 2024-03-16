import type { Any } from "../types/any.ts";

/**
 * Checks if a value is a string.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a string, `false` otherwise.
 */
const isString = (value: unknown): boolean => typeof value === "string";
/**
 * Checks if a value is a boolean.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a boolean, `false` otherwise.
 */
const isBoolean = (value: unknown): boolean => typeof value === "boolean";
/**
 * Checks if a value is a number.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a number, `false` otherwise.
 */
const isNumber = (value: unknown): boolean => typeof value === "number";
/**
 * Checks if a value is undefined.
 *
 * @param value - The value to check.
 * @returns `true` if the value is undefined, `false` otherwise.
 */
const isUndefined = (value: unknown): boolean => typeof value === "undefined";
/**
 * Checks if a value is a BigInt.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a BigInt, `false` otherwise.
 */
const isBigInt = (value: unknown): boolean => typeof value === "bigint";
/**
 * Checks if a value is an array.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
const isArray = (value: unknown): boolean => Array.isArray(value);
/**
 * Checks if a value is null.
 *
 * @param value - The value to check.
 * @returns Returns `true` if the value is null, `false` otherwise.
 */
const isNull = (value: unknown): boolean => value === null;
/**
 * Checks if a value is an object.
 *
 * @param value - The value to check.
 * @returns Returns `true` if the value is an object, else `false`.
 */
const isObject = (value: unknown): boolean =>
	Object.prototype.toString.call(value) === "[object Object]";

/**
 * Checks if a value is a Map.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a Map, `false` otherwise.
 */
const isMap = (value: unknown): boolean =>
	Object.prototype.toString.call(value) === "[object Map]";

/**
 * Checks if a value is a function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a function, `false` otherwise.
 */
const isFunction = (value: unknown): boolean => typeof value === "function";

/**
 * Checks if a value is truthy.
 *
 * The following conditions are truthy:
 * - A string with a length greater than 0.
 * - An array with a length greater than 0.
 * - An object with at least one key.
 * - A Map with at least one key.
 * - A number greater than 0.
 * - A BigInt greater than 0n.
 * - A boolean with a value of `true`.
 *
 * @param value - The value to check.
 * @returns `true` if the value is truthy, `false` otherwise.
 */
const isTruthy = (value: unknown): boolean => {
	switch (true) {
		case isString(value):
			return (value as string).length > 0;
		case isArray(value):
			return (value as Array<Any>).length > 0;
		case isObject(value):
			return Object.keys(value as object).length > 0;
		case isMap(value):
			return (value as Map<string, Any>).size > 0;
		case isNumber(value):
			return (value as number) > 0;
		case isBigInt(value):
			return (value as bigint) > 0n;
		case isBoolean(value):
			return value as boolean;
		default:
			return false;
	}
};

export {
	isArray,
	isBigInt,
	isBoolean,
	isFunction,
	isMap,
	isNull,
	isNumber,
	isObject,
	isString,
	isUndefined,
	isTruthy,
};
