import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["dist/**"] },
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            // possible errors
            "no-console": "warn",
            "no-debugger": "warn",

            // best practices
            eqeqeq: ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
            curly: ["error", "all"],

            // style (niekonfliktowe z Prettierem)
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["cache-bust.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
