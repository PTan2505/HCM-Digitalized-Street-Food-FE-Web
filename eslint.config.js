import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      // TypeScript strict type safety (matches tsconfig settings)
      '@typescript-eslint/no-explicit-any': 'error', // Disallow 'any' type (matches noImplicitAny)
      '@typescript-eslint/no-unused-vars': 'warn', // Warn on unused variables (relaxed for dev)
      '@typescript-eslint/explicit-function-return-type': 'warn', // Warn if function return type not specified
      '@typescript-eslint/no-redundant-type-constituents': 'off', // Temporarily disabled - the User | null union is valid

      // Core ESLint rules that match tsconfig
      'no-unreachable': 'error', // Error on unreachable code (matches allowUnreachableCode: false)
      'default-case': 'error', // Require default case in switch (matches noFallthroughCasesInSwitch)

      // TypeScript-specific rules
      '@typescript-eslint/no-inferrable-types': 'off', // Allow explicit types even if inferrable
      '@typescript-eslint/no-non-null-assertion': 'warn', // Warn on non-null assertions
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // Prefer nullish coalescing (matches strict null checks)
      '@typescript-eslint/prefer-optional-chain': 'error', // Prefer optional chaining

      // Disabled rules to match relaxed tsconfig settings
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',

      // Import restrictions
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features/*',
              from: './src/features/*',
            },
            {
              target: './src/app/**/*',
              from: './src/features/**/*',
            },
            {
              target: [
                './src/components/**/*',
                './src/hooks/**/*',
                './src/utils/**/*',
                './src/slices/**/*',
                './src/config/**/*',
                './src/constants/**/*',
              ],
              from: ['./src/features/**/*', './src/app/**/*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  }
);
