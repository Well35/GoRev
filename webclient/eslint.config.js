import js from '@eslint/js';
import ts from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...vue.configs['flat/recommended'],
    prettier,
    {
        files: ['src/**/*.{ts,vue}'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                parser: ts.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            // TypeScript
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',

            // Vue
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',

            // General
            'no-console': 'warn',
            'eqeqeq': ['error', 'always'],
        },
    },
];
