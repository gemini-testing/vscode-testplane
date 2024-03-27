module.exports = {
    extends: ["gemini-testing", "plugin:@typescript-eslint/recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    parserOptions: {
        ecmaVersion: 2022,
    },
    overrides: [
        {
            files: ["*.ts"],
            rules: {
                "@typescript-eslint/explicit-function-return-type": "error",
                "@typescript-eslint/no-unsafe-declaration-merging": "off",
            },
        },
    ],
};
