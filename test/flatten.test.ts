import {
	assertEquals,
	assertObjectMatch,
} from "https://deno.land/std@0.218.2/assert/mod.ts";
import { Flattened } from "../util/flatten.ts";

Deno.test("toObject method returns the unflattened object", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	// flattened.someProperty = someValue;

	const result = flattened.toObject();
	// Add your expected unflattened object here
	const expected = { some: { nested: { property: "value" } } };

	assertObjectMatch(result, expected);
});

Deno.test("toObject method returns the unflattened object", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	// flattened.someProperty = someValue;

	const result = flattened.toObject();
	// Add your expected unflattened object here
	const expected = { some: { nested: { property: "value" } } };

	assertObjectMatch(result, expected);
});

Deno.test(
	"toString method returns the string representation of the Flattened object",
	() => {
		const flattened = Flattened.toFlattened({
			some: { nested: { property: "value" } },
		});
		// Add your test data here
		// flattened.someProperty = someValue;

		const result = flattened.toString();
		// Add your expected string representation here
		const expected = JSON.stringify({
			__data: flattened.__data,
			__map: flattened.__map,
		});

		assertEquals(result, expected);
	},
);

Deno.test("getMappedKey method returns the mapped key", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	const key = "some.nested.property";

	const result = flattened.getMappedKey(key);
	// Add your expected mapped key here
	const expected = "some:o.nested:o.property:s";

	assertEquals(result, expected);
});

Deno.test("getMappedKey method returns undefined for non-existent key", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	const key = "nonExistentKey";

	const result = flattened.getMappedKey(key);
	// Add your expected result here
	const expected = undefined;

	assertEquals(result, expected);
});

Deno.test("getKey method returns the value for the given key", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	const key = "some.nested.property";

	const result = flattened.getKey<string>(key);
	// Add your expected value here
	const expected = "value";

	assertEquals(result, expected);
});

Deno.test("getKey method returns undefined for non-existent key", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	const key = "nonExistentKey";

	const result = flattened.getKey<string>(key);
	// Add your expected result here
	const expected = undefined;

	assertEquals(result, expected);
});

Deno.test("hasKey method returns true for existing key", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	const key = "some.nested.property";

	const result = flattened.hasKey(key);
	// Add your expected result here
	const expected = true;

	assertEquals(result, expected);
});

Deno.test("hasKey method returns false for non-existent key", () => {
	const flattened = Flattened.toFlattened({
		some: { nested: { property: "value" } },
	});
	// Add your test data here
	const key = "nonExistentKey";

	const result = flattened.hasKey(key);
	// Add your expected result here
	const expected = false;

	assertEquals(result, expected);
});

Deno.test(
	"mergeFlattened method merges the data and map of two Flattened objects",
	() => {
		const flattened1 = Flattened.toFlattened({
			some: { nested: { property: "value1" } },
		});
		const flattened2 = Flattened.toFlattened({
			another: { nested: { property: "value2" } },
		});

		const result = flattened1.mergeFlattened(flattened2);

		const expectedData = {
			"some:o.nested:o.property:s": "value1",
			"another:o.nested:o.property:s": "value2",
		};
		const expectedMap = {
			"some.nested.property": "some:o.nested:o.property:s",
			"another.nested.property": "another:o.nested:o.property:s",
		};

		assertObjectMatch(result.__data, expectedData);
		assertObjectMatch(result.__map, expectedMap);
	},
);

Deno.test(
	"mergeObject method merges the given object and returns a Flattened object",
	() => {
		const flattened = Flattened.toFlattened({
			some: { nested: { property: "value" } },
		});
		flattened.mergeObject({ another: { nested: { property: "value" } } });

		const expectedData = {
			"some:o.nested:o.property:s": "value",
			"another:o.nested:o.property:s": "value",
		};
		const expectedMap = {
			"some.nested.property": "some:o.nested:o.property:s",
			"another.nested.property": "another:o.nested:o.property:s",
		};

		assertObjectMatch(flattened.__data, expectedData);
		assertObjectMatch(flattened.__map, expectedMap);
	},
);

// "toFlattened method returns a Flattened object"
Deno.test("toFlattened method returns a Flattened object", () => {
	const obj = {
		some: {
			nested: { property: "value", array: [1, "a", 4n, { inside: "array" }] },
		},
	};
	const result = Flattened.toFlattened(obj);
	const expectedData = {
		"some:o.nested:o.property:s": "value",
		"some:o.nested:o.array:a.0:i;n": 1,
		"some:o.nested:o.array:a.1:i;s": "a",
		"some:o.nested:o.array:a.2:i;bi": "4",
		"some:o.nested:o.array:a.3:i;o.inside:s": "array",
	};
	const expectedMap = {
		"some.nested.property": "some:o.nested:o.property:s",
		"some.nested.array.0": "some:o.nested:o.array:a.0:i;n",
		"some.nested.array.1": "some:o.nested:o.array:a.1:i;s",
		"some.nested.array.2": "some:o.nested:o.array:a.2:i;bi",
		"some.nested.array.3.inside": "some:o.nested:o.array:a.3:i;o.inside:s",
	};

	assertObjectMatch(result.__data, expectedData);
	assertObjectMatch(result.__map, expectedMap);
});

Deno.test(
	"fromFlattened method creates a new Flattened object from a Flattened instance",
	() => {
		const flattenedData = {
			"some:o.nested:o.property:s": "value",
			"another:o.nested:o.property:s": "value",
		};
		const flattenedMap = {
			"some.nested.property": "some:o.nested:o.property:s",
			"another.nested.property": "another:o.nested:o.property:s",
		};
		const flattened = new Flattened({
			__data: flattenedData,
			__map: flattenedMap,
		});

		const result = Flattened.fromFlattened(flattened);

		assertObjectMatch(result.__data, flattenedData);
		assertObjectMatch(result.__map, flattenedMap);
	},
);

Deno.test(
	"fromFlattened method creates a new Flattened object from a FlattenedObject",
	() => {
		const flattenedObject = Flattened.toFlattened({
			some: { nested: { property: "value" } },
		});

		const result = Flattened.fromFlattened(flattenedObject);

		assertObjectMatch(result.__data, flattenedObject.__data);
		assertObjectMatch(result.__map, flattenedObject.__map);
	},
);

// Test if the Flattened class detects that the map isn't the same length as the data and generates a new map
Deno.test(
	"Flattened class generates a new map if the map isn't the same length as the data",
	() => {
		const flattened = new Flattened({
			__data: {
				"some:o.nested:o.property:s": "value",
				"another:o.nested:o.property:s": "value",
			},
			__map: {
				"some.nested.property": "some:o.nested:o.property:s",
			},
		});

		const expectedMap = {
			"some.nested.property": "some:o.nested:o.property:s",
			"another.nested.property": "another:o.nested:o.property:s",
		};

		assertObjectMatch(flattened.__map, expectedMap);
	},
);

// Test if the Flattened class detects circular references
Deno.test(
	"Flattened class detects and handles circular references correctly",
	() => {
		const obj: Record<string, unknown> = {
			some: { nested: { property: "value" } },
		};

		// @ts-ignore
		obj.some.nested.circular = obj.some;

		const flattened = Flattened.toFlattened(obj);
		const unflattened = flattened.toObject();

		const expected_data = {
			"some:o.nested:o.property:s": "value",
			"some:o.nested:o.circular:c": "some",
		};
		const expected_map = {
			"some.nested.property": "some:o.nested:o.property:s",
			"some.nested.circular": "some:o.nested:o.circular:c",
		};

		assertObjectMatch(flattened.__data, expected_data);
		assertObjectMatch(flattened.__map, expected_map);
		assertObjectMatch(unflattened, obj);
		// @ts-ignore
		assertEquals(unflattened.some.nested.circular, unflattened.some);
	},
);
