import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: ["./src/extension.ts"],
        outDir: "out",
        external: ["vscode"],
        format: "cjs",
    },
    {
        entry: {
            worker: "./src/worker/index.ts",
        },
        outDir: "out",
        format: "cjs",
    },
]);
