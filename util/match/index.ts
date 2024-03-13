// Parsers
import { parseBool, parseFn, parseKey, parseNum, parseStr } from "./refs.ts";

// Utils
import { getArgTypes } from "./utils/parse.ts";

// Types
import type { Any } from "../../types/any.ts";
import type { FuncObj } from "../../types/fn.ts";

/**
 * Parses the parameters of a string and returns an array of parsed values.
 *
 * @param param - The string containing the parameters to parse.
 * @param ctx - The context object containing the necessary data for parsing.
 * @param fns - The function object containing the necessary functions for parsing.
 * @param key_call_stack - The call stack for tracking nested key parsing.
 * @param max_call_stack - The maximum depth of the call stack for nested key parsing.
 * @returns An array of parsed values.
 */
const parseParams = ({
  param,
  ctx,
  fns,
  value,
  key_call_stack = [],
  max_call_stack = 20,
}: {
  param: string;
  ctx: Record<string, unknown>;
  fns: FuncObj;
  value?: unknown;
  key_call_stack?: string[];
  max_call_stack?: number;
}): Any[] => {
  const out: Any[] = [];
  const params = getArgTypes(param);
  for (let i = 0; i < params.length; i++) {
    const [t, v] = params[i];

    switch (t) {
      case "str":
        out.push(parseStr(v));
        break;
      case "key": {
        if (v.startsWith("p")) {
          const parsed = parseKey({
            str: v,
            ctx,
            fns,
            value,
            key_call_stack,
            max_call_stack,
            parse_val: true,
          });

          if (Array.isArray(parsed)) {
            out.push(...parsed);
          } else {
            out.push(parsed);
          }
        } else {
          out.push(
            parseKey({
              str: v,
              ctx,
              fns,
              value,
              key_call_stack,
              max_call_stack,
            }),
          );
        }
        break;
      }
      case "bool":
        out.push(parseBool(v));
        break;
      case "num":
        out.push(parseNum(v));
        break;
      case "fun":
        out.push(
          parseFn({ str: v, ctx, fns, value, key_call_stack, max_call_stack }),
        );
        break;
      case "empty":
        out.push(undefined);
        break;
    }
  }

  return out.flat(1);
};

export { parseParams };
