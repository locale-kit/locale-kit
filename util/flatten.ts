import {
	isArray,
	isBigInt,
	isBoolean,
	isNull,
	isNumber,
	isObject,
	isString,
	isUndefined,
} from "./is.ts";
import { getNestedKeyValue } from "./obj.ts";

type FlattenedObject = {
	__map: Record<string, string>;
	__data: Record<string, unknown>;
} & Record<string, unknown>;
type ValueType =
	| "string"
	| "boolean"
	| "number"
	| "undefined"
	| "bigint"
	| "array"
	| "null"
	| "object"
	| "index"
	| "circular";

export class Flattened {
	__data: Record<string, unknown>;
	__map: Record<string, string>;

	constructor(
		flattened: FlattenedObject | Flattened = { __data: {}, __map: {} },
	) {
		this.__data = flattened.__data;

		if (Object.keys(flattened.__map) !== Object.keys(flattened.__data)) {
			this.__map = Flattened.utils.generateMap(flattened.__data);
		} else {
			this.__map = flattened.__map;
		}
	}

	/**
	 * Converts an object into a flattened representation.
	 * @param obj - The object to be flattened.
	 * @returns The flattened representation of the object.
	 */
	static toFlattened(obj: Record<string, unknown>): Flattened {
		return Flattened.flatten.flattenObject({ to_flatten: obj });
	}

	/**
	 * Creates a new Flattened instance from a flattened object.
	 *
	 * @param flattened The flattened object to create the Flattened instance from.
	 * @returns A new Flattened instance.
	 */
	static fromFlattened(flattened: Flattened | FlattenedObject): Flattened {
		return new Flattened(flattened);
	}

	/**
	 * Converts the Flattened object to a nested object that should match the original object.
	 * @returns The nested object representation of the Flattened object.
	 */
	toObject<T = Record<string, unknown>>(): T {
		return Flattened.unflatten.unflattenObject({ flattened: this }) as T;
	}

	/**
	 * Retrieves the mapped value for the given key.
	 *
	 * @param key - The key to retrieve the mapped value for.
	 * @returns The mapped value for the given key.
	 */
	getMappedKey(key: string): string {
		return this.__map[key];
	}

	/**
	 * Retrieves the value associated with the specified key from the data object.
	 *
	 * @template T - The type of the value to retrieve.
	 * @param key - The key of the value to retrieve.
	 * @returns The value associated with the specified key.
	 */
	getKey<T = unknown>(key: string): T {
		return this.__data[this.getMappedKey(key)] as T;
	}

	/**
	 * Checks if the specified key exists in the flattened object.
	 * @param key - The key to check.
	 * @returns `true` if the key exists, `false` otherwise.
	 */
	hasKey(key: string): boolean {
		return this.getMappedKey(key) !== undefined;
	}

	/**
	 * Merges the provided `flattened` object into the current `Flattened` object.
	 *
	 * @param flattened - The `Flattened` object to merge.
	 * @returns The merged `Flattened` object.
	 */
	mergeFlattened(flattened: Flattened): Flattened {
		this.__data = { ...this.__data, ...flattened.__data };
		this.__map = { ...this.__map, ...flattened.__map };

		return this;
	}

	/**
	 * Merges the provided object into a flattened structure.
	 *
	 * @param obj - The object to be flattened.
	 * @returns The flattened object.
	 */
	mergeObject(obj: Record<string, unknown>): Flattened {
		const flattened = Flattened.flatten.flattenObject({ to_flatten: obj });

		return this.mergeFlattened(flattened);
	}

	/**
	 * Returns a string representation of the object.
	 * @returns A string representation of the object.
	 */
	toString(): string {
		return JSON.stringify({ __data: this.__data, __map: this.__map });
	}

	/**
	 * A mapping of value types to their corresponding postfix strings.
	 */
	static key_postfix = {
		string: "s",
		boolean: "b",
		number: "n",
		undefined: "u",
		array: "a",
		object: "o",
		index: "i",
		circular: "c",
		bigint: "bi",
		null: "nu",
	};
	/**
	 * Mapping of key postfixes to their corresponding value types.
	 */
	static key_postfix_rev = {
		s: "string",
		b: "boolean",
		n: "number",
		u: "undefined",
		a: "array",
		o: "object",
		i: "index",
		c: "circular",
		bi: "bigint",
		nu: "null",
	};

	private static utils = {
		generateMap(data: Record<string, unknown>): Record<string, string> {
			const map: Record<string, string> = {};

			for (const [key, _value] of Object.entries(data)) {
				const decoded_key = key
					.split(".")
					.map((part) => Flattened.unflatten.decodeKeyPart(part).key)
					.join(".");

				map[decoded_key] = key;
			}

			return map;
		},
	};

	/**
	 * Utility class for flattening objects.
	 */
	private static flatten = {
		/**
		 * Encodes a key part and appends the value type postfix.
		 * @param part The key part to encode.
		 * @param val_type The value type.
		 * @returns The encoded key part with the value type postfix.
		 */
		encodeKeyPart(
			part: string,
			val_type: ValueType,
			secondary_val_type?: ValueType,
		): string {
			const key = encodeURIComponent(part).replaceAll(".", "%2E");

			return `${key}:${Flattened.key_postfix[val_type]}${
				secondary_val_type
					? `;${Flattened.key_postfix[secondary_val_type]}`
					: ""
			}`;
		},
		/**
		 * Retrieves the type information for a given key-value pair.
		 *
		 * @param key - The key of the pair.
		 * @param value - The value of the pair.
		 * @param manual_value_type - (Optional) A manually specified value type.
		 * @returns An object containing the key, raw_key, value_type, and invalid flag.
		 */
		getType(
			key: string,
			value: unknown,
			manual_value_type?: ValueType,
		): {
			key: string;
			raw_key: string;
			value_type: ValueType;
			invalid: boolean;
		} {
			let key_part: string;
			let value_type: ValueType;

			switch (true) {
				case manual_value_type === "index": {
					const { value_type: new_value_type } = this.getType(key, value);

					value_type = new_value_type;
					key_part = this.encodeKeyPart(
						key,
						manual_value_type as "index",
						value_type,
					);
					break;
				}
				case isString(value):
					value_type = "string";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isBoolean(value):
					value_type = "boolean";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isNumber(value):
					value_type = "number";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isUndefined(value):
					value_type = "undefined";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isBigInt(value):
					value_type = "bigint";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isArray(value):
					value_type = "array";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isNull(value):
					value_type = "null";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				case isObject(value):
					value_type = "object";
					key_part = this.encodeKeyPart(key, value_type);
					break;
				default:
					return {
						invalid: true,
						key: "",
						value_type: "undefined",
						raw_key: "",
					};
			}

			return {
				key: key_part,
				value_type,
				raw_key: key,
				invalid: false,
			};
		},
		/**
		 * Sets a property in the FlattenedObject.
		 *
		 * @param obj - The FlattenedObject to set the property in.
		 * @param key - The key of the property.
		 * @param value - The value of the property.
		 * @param value_type - The type of the value.
		 * @param raw_key - The raw key of the property.
		 */
		setProperty({
			obj,
			key,
			value,
			value_type,
			raw_key,
			visited,
		}: {
			obj: Flattened;
			key: string;
			value: unknown;
			value_type: ValueType;
			raw_key: string;
			visited?: Map<object, string>;
		}): void {
			const data = obj.__data;
			const map = obj.__map;

			switch (value_type) {
				case "string":
				case "boolean":
				case "number":
				case "circular":
					data[key] = value;
					map[raw_key] = key;
					break;
				case "undefined":
				case "null":
					data[key] = 0;
					map[raw_key] = key;
					break;
				case "bigint": {
					data[key] = (<bigint>value).toString();
					map[raw_key] = key;
					break;
				}
				case "array": {
					(value as unknown[]).forEach((el, i) => {
						const {
							key: new_key,
							value_type: new_value_type,
							raw_key: new_raw_key,
						} = this.getType(i.toString(), el, "index");
						if (!new_key || !new_value_type) return;

						this.setProperty({
							obj,
							key: `${key}.${new_key}`,
							value: el,
							value_type: new_value_type,
							raw_key: `${raw_key}.${new_raw_key}`,
							visited,
						});
					});
					break;
				}
				case "object": {
					this.flattenObject({
						to_flatten: value as Record<string, unknown>,
						parent_key: key,
						result: obj,
						raw_parent_key: raw_key,
						visited,
					});
					break;
				}
			}
		},
		/**
		 * Flattens an object by recursively iterating through its properties and creating a new object with flattened keys.
		 *
		 * @param to_flatten - The object to be flattened.
		 * @param parent_key - The parent key used for nested properties. Default is an empty string.
		 * @param raw_parent_key - The raw parent key used for nested properties. Default is an empty string.
		 * @param result - The result object that stores the flattened properties. Default is a new instance of Flattened.
		 * @returns The flattened object.
		 */
		flattenObject({
			to_flatten,
			parent_key = "",
			raw_parent_key = "",
			result = new Flattened(),
			visited = new Map<object, string>(),
		}: {
			to_flatten: object;
			parent_key?: string;
			raw_parent_key?: string;
			result?: Flattened;
			visited?: Map<object, string>;
		}): Flattened {
			// Check if the object has already been visited
			if (visited.has(to_flatten)) {
				const circ_path = visited.get(to_flatten);

				this.setProperty({
					// Replace the last value type (likely object - :o) with the circular type (:c)
					key: `${parent_key.substring(0, parent_key.length - 2)}:c`,
					obj: result,
					raw_key: raw_parent_key,
					value: circ_path === "" ? "__root__" : circ_path,
					value_type: "circular",
					visited,
				});
				return result;
			}

			// Add the object to the visited set
			visited.set(to_flatten, raw_parent_key);
			const entries = Object.entries(to_flatten);

			for (const [key_name, value] of entries) {
				// Encode key parts to handle special characters and array-like keys.
				const { value_type, key } = this.getType(key_name, value);
				const new_key = parent_key ? `${parent_key}.${key}` : key;
				const new_raw_parent_key = raw_parent_key
					? `${raw_parent_key}.${key_name}`
					: key_name;

				this.setProperty({
					obj: result,
					key: new_key,
					value,
					value_type,
					raw_key: new_raw_parent_key,
					visited,
				});
			}

			// Remove the object from the visited set after processing
			// visited.delete(to_flatten);

			return result;
		},
	};

	/**
	 * Utility class for unflattening data.
	 */
	private static unflatten = {
		/**
		 * Decodes a key part of a flattened object.
		 * @param part - The key part to decode.
		 * @returns An object containing the decoded key and value type.
		 */
		decodeKeyPart(part: string): {
			key: string;
			value_type: ValueType;
			secondary_value_type?: ValueType;
		} {
			const [key, value_type_raw] = part.split(":");

			const [value_type, secondary_value_type] = value_type_raw.split(";");

			return {
				key: decodeURIComponent(key),
				value_type: Flattened.key_postfix_rev[
					value_type as keyof typeof Flattened.key_postfix_rev
				] as ValueType,
				secondary_value_type: Flattened.key_postfix_rev[
					secondary_value_type as keyof typeof Flattened.key_postfix_rev
				] as ValueType,
			};
		},

		/**
		 * Sets the value of a property in an object or array based on the specified key and value type.
		 * @param obj - The object or array to modify.
		 * @param key - The key of the property to set.
		 * @param value - The value to set.
		 * @param value_type - The type of the value.
		 * @param raw_key - The raw key string.
		 */
		setProperty({
			obj,
			key,
			value,
			value_type,
		}: {
			obj: Record<string, unknown> | unknown[];
			key: string;
			value: unknown;
			value_type: ValueType;
			raw_key: string;
		}): void {
			switch (value_type) {
				case "string":
				case "boolean":
				case "number":
				case "circular":
					(obj as Record<string, unknown>)[key] = value;
					break;
				case "undefined":
					(obj as Record<string, unknown>)[key] = undefined;
					break;
				case "null":
					(obj as Record<string, unknown>)[key] = null;
					break;
				case "bigint": {
					(obj as Record<string, unknown>)[key] = BigInt(value as string);
					break;
				}
				case "array": {
					if (!isArray((obj as Record<string, unknown>)[key])) {
						(obj as Record<string, unknown>)[key] = [];
					}
					break;
				}
				case "object": {
					if (!isObject((obj as Record<string, unknown>)[key])) {
						(obj as Record<string, unknown>)[key] = {};
					}
					break;
				}
			}
		},

		/**
		 * Unflattens a flattened object.
		 * @param flattened - The flattened object to unflatten.
		 * @returns The unflattened object.
		 */
		unflattenObject({
			flattened,
		}: { flattened: Flattened }): Record<string, unknown> {
			const data = flattened.__data;
			const result: Record<string, unknown> = {};

			// For each entry in the flattened array, set the property in the result object.
			for (const [raw_flattened_key, val] of Object.entries(data)) {
				// Split the keys by the dot to get the nested keys.
				const keys = raw_flattened_key.split(".");
				// Create a reference object for this specific loop to keep track of where to set the key
				let ref = result;

				for (let i = 0; i < keys.length; i++) {
					// Get the key part and value type
					const encoded_key = keys[i];
					// const next = keys[i + 1]
					const { key, value_type, secondary_value_type } =
						this.decodeKeyPart(encoded_key);

					switch (value_type) {
						case "string":
						case "boolean":
						case "number":
						case "undefined":
						case "null":
							this.setProperty({
								key,
								value: val,
								raw_key: encoded_key,
								obj: ref,
								value_type: value_type,
							});
							break;
						case "array":
							if (!isArray(ref[key])) ref[key] = [];
							ref = ref[key] as Record<string, unknown>;
							break;

						case "object":
							if (!isObject(ref[key])) ref[key] = {};
							ref = ref[key] as Record<string, unknown>;
							break;

						case "index": {
							// If there is no secondary_value_type, then ignore this
							if (!secondary_value_type) break;

							// Use the secondary_value_type to determine if the next key is an object or array
							// If the next key is an object or array, create a new object or array and set that to the ref
							if (
								secondary_value_type === "object" ||
								secondary_value_type === "array"
							) {
								ref[key] = secondary_value_type === "object" ? {} : [];
								ref = ref[key] as Record<string, unknown>;

								break;
							}

							// If the next key is not an object or array, set the value to the ref
							this.setProperty({
								key,
								value: val,
								raw_key: encoded_key,
								obj: ref,
								value_type: secondary_value_type,
							});
							break;
						}
						case "circular": {
							// If the value type is circular, set the value to the ref
							let referenced: object;

							if (val === "__root__") {
								referenced = result;
							} else {
								referenced = getNestedKeyValue(result, val as string) as object;
							}

							this.setProperty({
								key,
								value: referenced,
								raw_key: encoded_key,
								obj: ref,
								value_type: value_type,
							});
							break;
						}
					}
				}
			}

			return result;
		},
	};
}
