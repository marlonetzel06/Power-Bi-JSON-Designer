import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'dist', 'node_modules', 'playwright-report', 'test-results', 'src/pbi/generated/**',
    // Legacy pre-reform code, replaced phase by phase and deleted in Phase 4.
    'src/components/**', 'src/hooks/**', 'src/utils/**', 'src/constants/**', 'src/store/themeStore.js', 'src/config/**', 'src/App.jsx', 'src/main.jsx', 'tests/**',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      // Design-system rule: no Tailwind palette colours and no raw hex in components. Tokens only.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/(^|\\s)(bg|text|border|ring|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}(\\/\\d+)?(\\s|$)/]',
          message: 'Tailwind palette colours are not allowed; use design-system tokens (e.g. bg-surface-card).',
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]',
          message: 'Raw hex colours are not allowed in className; use design-system tokens.',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', '*.config.ts', 'tests/**/*.ts'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
