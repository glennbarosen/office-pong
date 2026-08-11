import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import vitest from '@vitest/eslint-plugin'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
    // `.output` is the Nitro build dir; routeTree.gen.ts is generated (@ts-nocheck, full of `as any`).
    { ignores: ['dist', '.output', 'src/routeTree.gen.ts', 'coverage'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
        linterOptions: {
            noInlineConfig: false,
            reportUnusedDisableDirectives: true,
        },
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.flatConfigs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    // Server code and build tooling run under Node, not the browser.
    {
        files: ['src/lib/server/**/*.ts', '*.{js,ts}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ['src/**/*.{test,spec}.{ts,tsx}'],
        plugins: { vitest },
        rules: vitest.configs.recommended.rules,
    },
    // Test helpers export utilities alongside components by design.
    {
        files: ['src/test/**/*.{ts,tsx}'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    // Config files are plain JS and outside the type-aware program.
    {
        files: ['*.js'],
        extends: [tseslint.configs.disableTypeChecked],
        languageOptions: {
            globals: globals.node,
        },
    },
    prettierConfig
)
