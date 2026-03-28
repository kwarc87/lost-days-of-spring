import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        rules: {
            // possible errors
            "no-console": "warn",
            "no-debugger": "warn",

            // best practices
            "eqeqeq": ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
            "curly": ["error", "all"],

            // style (niekonfliktowe z Prettierem)
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        },
    },
];

