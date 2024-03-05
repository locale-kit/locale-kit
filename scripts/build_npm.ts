// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.32.1/mod.ts";

const DIR_NAME = "npm_build";

await emptyDir(`./${DIR_NAME}`);

await build({
	entryPoints: ["./mod.ts", "./demo.ts"],
	outDir: `./${DIR_NAME}`,
	shims: {
		// see JS docs for overview and more options
		deno: true,
	},
	test: true,
	declaration: true,
	package: {
		// package.json properties
		name: "@locale-kit/locale-kit",
		version: Deno.args[0],
		description: "A i18n/l10n library from Deno to Node ❤️",
		license: "MIT",
		repository: {
			type: "git",
			url: "git+https://github.com/locale-kit/locale-kit.git",
		},
		bugs: {
			url: "https://github.com/locale-kit/locale-kit/issues",
		},
	},
});

// post build steps
Deno.copyFileSync("LICENSE", `${DIR_NAME}/LICENSE`);
Deno.copyFileSync("README.md", `${DIR_NAME}/README.md`);
