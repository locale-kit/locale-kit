const isString = (value: unknown): boolean => typeof value === "string";
const isBoolean = (value: unknown): boolean => typeof value === "boolean";
const isNumber = (value: unknown): boolean => typeof value === "number";
const isUndefined = (value: unknown): boolean => typeof value === "undefined";
const isBigInt = (value: unknown): boolean => typeof value === "bigint";
const isArray = (value: unknown): boolean => Array.isArray(value);
const isNull = (value: unknown): boolean => value === null;
const isObject = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Object]";
const isFunction = (value: unknown): boolean => typeof value === "function";

export {
  isArray,
  isBigInt,
  isBoolean,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
};
