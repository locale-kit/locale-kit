/**
 * Get a nested key value from an object
 * @param obj Object to get the nested key of
 * @param key Key to get the value of
 * @returns The value of the nested key or undefined
 */
const getNestedKeyValue = (
  obj: Record<string, unknown>,
  key: string,
): unknown | undefined => {
  const keys = key.split(".");
  let cur_obj = obj;

  for (let i = 0; i < keys.length; i++) {
    const cur_key = keys[i];
    // Protect against prototype pollution, constructor, or escaping into the global scope
    if (
      cur_key === "__proto__" ||
      cur_key === "constructor" ||
      cur_key === "prototype"
    ) {
      return undefined;
    }

    if (cur_obj[cur_key] === undefined) {
      return undefined;
    }
    cur_obj = cur_obj[cur_key] as Record<string, unknown>;
  }

  return cur_obj;
};

export { getNestedKeyValue };
