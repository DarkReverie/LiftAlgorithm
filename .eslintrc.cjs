module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
    },

    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },

    plugins: ["@typescript-eslint", "import"],

    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
    ],

    rules: {
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "comma-dangle": ["error", "always-multiline"],

        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",

        "import/order": [
            "warn",
            {
                "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
                "newlines-between": "always",
            },
        ],
        "no-console": "off",
    },
};
