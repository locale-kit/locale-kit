import { assertEquals } from "./_test.ts";
import { format } from "../util/format.ts";
import type { FuncType } from "../types/fn.ts";
import type { FuncObj } from "../types/fn.ts";
import { Is } from "../mod.ts";

Deno.test("Format with no data", () => {
  const str = "Hello, {{name}}!";
  const result = format(str);
  assertEquals(result, "Hello, [no_value]!");
});

Deno.test("Format with data", () => {
  const str = "Hello, {{key: 'name'}}!";
  const data = { name: "John Doe" };
  const result = format(str, data);
  assertEquals(result, "Hello, John Doe!");
});

Deno.test("Format with nested data", () => {
  const str = "Hello, {{key: 'user.name'}}!";
  const data = { user: { name: "John Doe" } };
  const result = format(str, data);
  assertEquals(result, "Hello, John Doe!");
});

Deno.test("Format with fallback value", () => {
  const str = "Hello, {{name}}||Guest||!";
  const data = { name: undefined };
  const result = format(str, data);
  assertEquals(result, "Hello, Guest!");
});

Deno.test("Format with conditional cases", () => {
  const str =
    "You have {{key:'count'}} [[~ {count} 1: `message` | default: `messages` ~]]";
  const data1 = { count: 1 };
  const data2 = { count: 2 };
  const result1 = format(str, data1);
  const result2 = format(str, data2);
  assertEquals(result1, "You have 1 message");
  assertEquals(result2, "You have 2 messages");
});

Deno.test("Format with functions", () => {
  const str =
    "You are [[~ {age} GTE(num:18): `an adult` | default: `a child` ~]]";
  const data1 = { age: 18 } as const;
  const data2 = { age: 17 };

  const fns: Record<string, FuncType<number, unknown[]>> = {
    GTE: ({ value, ctx }) => value >= (ctx?.age as number),
  };

  const result1 = format(str, data1, fns);
  const result2 = format(str, data2, fns);
  assertEquals(result1, "You are an adult");
  assertEquals(result2, "You are a child");
});

Deno.test("Format with empty string", () => {
  const str = "";
  const result = format(str);
  assertEquals(result, "");
});

Deno.test("Format with no placeholders", () => {
  const str = "Hello, world!";
  const result = format(str);
  assertEquals(result, "Hello, world!");
});

Deno.test("Format with missing data", () => {
  const str = "Hello, {{name}}!";
  const result = format(str);
  assertEquals(result, "Hello, [no_value]!");
});

Deno.test("Format with missing nested data", () => {
  const str = "Hello, {{user.name}}!";
  const data = { user: {} };
  const result = format(str, data);
  assertEquals(result, "Hello, [no_value]!");
});

Deno.test("Format with missing fallback value", () => {
  const str = "Hello, {{name}}||Guest||!";
  const data = {};
  const result = format(str, data);
  assertEquals(result, "Hello, Guest!");
});

Deno.test("Format with invalid function", () => {
  const str =
    "You are [[~ {age} INVALID(num:18): `an adult` | default: `a child` ~]]";
  const data = { age: 18 };
  const result = format(str, data);
  assertEquals(result, "You are a child");
});

Deno.test("Format with custom function", () => {
  const str = "Hi, {{fn: [utils.capitalize]( key:'name' )}}";
  const data1 = { name: "John", int: 3 };
  const data2 = { name: "Dave", int: 2 };

  const fns: FuncObj = {
    utils: {
      // Set the type to
      capitalize({ params }) {
        const res: string[] = [];

        for (let i = 0; i < params.length; i++) {
          const el = params[i];

          if (el === null) {
            res.push("null");
            continue;
          }

          if (el === undefined) {
            res.push("undefined");
            continue;
          }

          if (Is.isObject(el) || Is.isArray(el)) {
            res.push(JSON.stringify(el));
            continue;
          }

          if (Is.isFunction(el)) {
            res.push(el.toString());
            continue;
          }

          res.push(el.toString());
        }

        return res.join(" ").toUpperCase();
      },
      toHex: ({ value }) => {
        return value.toString(16);
      },
    },
  };
  // str, data1, fns
  const result1 = format(str, data1, fns);
  const result2 = format(str, data2, fns);
  assertEquals(result1, "Hi, JOHN");
  assertEquals(result2, "Hi, DAVE");
});
