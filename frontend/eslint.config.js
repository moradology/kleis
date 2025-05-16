import globals from 'globals';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintJs from '@eslint/js';
// For React specific rules - ensure these are installed
// import reactRecommended from 'eslint-plugin-react/configs/recommended.js'; // if using this
// import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'; // if using this
// import reactHooks from 'eslint-plugin-react-hooks'; // if using this

// Note: Depending on your eslint-plugin-react setup, you might need to import differently
// For example, if `eslint-plugin-react` doesn't export `configs` directly in flat config yet,
// you might need to manually configure rules or use a compatibility layer if available.
// For simplicity, I'm showing a common structure. Adjust if your `eslint-plugin-react` version differs.

export default tseslint.config(
  {
    // Global ignores
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'public/',
      '**/.*.*', // Ignore dotfiles like .DS_Store
      '*.d.ts', // Ignore TypeScript declaration files in the root
      'src/env.d.ts',
      '.astro/types.d.ts',
      '.astro/content.d.ts',
    ],
  },
  // Base ESLint recommended rules
  eslintJs.configs.recommended,

  // TypeScript configurations
  ...tseslint.configs.recommendedTypeChecked, // For type-aware linting
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname, // Correctly set for finding tsconfig.json
      },
    },
    files: ['**/*.{ts,tsx,mts,cts}'], // Apply to all TS files
    rules: {
      // Add or override TypeScript rules here
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // You might want to relax this for specific cases or handle it properly
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },

  // Astro configurations
  ...astroPlugin.configs['flat/recommended'], // Use the flat config version
  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Astro components can run in Node.js context (SSR)
      },
      parserOptions: {
        parser: tseslint.parser, // Specify TypeScript parser for script tags
        project: true, // Enable type-aware linting for <script> tags
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.astro'], // Important for astro-eslint-parser
      },
    },
    processor: astroPlugin.processors.astro, // Use the processor
    rules: {
      // Astro specific rules or overrides
      // e.g., '@typescript-eslint/no-unused-vars': 'off', // if handled differently by Astro
    },
  },
  // Configuration for TypeScript within Astro components (script tags)
  {
    files: ['**/*.astro/*.ts', '**/*.astro/*.tsx'], // Target TS/TSX in Astro
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Rules specific to TS inside Astro, if needed
      // Often inherits from the global TS config
    },
  },

  // React/TSX configurations (for .tsx files outside Astro)
  {
    files: ['src/**/*.{tsx,jsx}'], // Target React components
    // If using eslint-plugin-react's flat configs:
    // ...reactRecommended, // (Ensure this is compatible or configure manually)
    // ...reactJsxRuntime, // (Ensure this is compatible or configure manually)
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      // 'react': reactPlugin, // if reactRecommended doesn't provide it
      // 'react-hooks': reactHooks, // if reactRecommended doesn't provide it
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Manually configure React rules if not using recommended flat configs
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-react': 'off', // Not needed
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',
      ...jsxA11y.configs.recommended.rules, // Apply JSX accessibility rules
      // Add other React specific rules
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },

  // Disable type-aware linting for JS configuration files
  {
    files: ['eslint.config.js', '*.config.js', '*.config.mjs', '*.config.cjs', 'vitest.setup.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-var-requires': 'off', // Allow require in CJS config files if any
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  }
);