import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import {defineConfig} from 'eslint/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    {
        ignores: [
            'dist/**'
        ]
    },
    ...compat.config({
        env: {
            node: true,
            es6: true
        },
        plugins: ['ghost'],
        extends: [
            'plugin:ghost/es'
        ],
        parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module'
        }
    })
]);
