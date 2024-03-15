/**
 * Retrieves the value of a nested key from an object.
 * @param obj - The object to retrieve the value from.
 * @param key - The nested key to retrieve the value for.
 * @returns The value of the nested key, or undefined if the key is not found.
 */
const getNestedKeyValue = (
	obj: Record<string, unknown>,
	key: string,
): unknown | undefined => {
	const keys = key.split(".");
	let cur_obj = obj;

	for (let i = 0; i < keys.length; i++) {
		const cur_key = keys[i];
		// Protect against prototype accessing, constructor, or escaping into the global scope
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
