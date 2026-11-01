const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/', 'coverage/', 'dist/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },
  },
  {
    rules: {
      // The git-parser API intentionally accepts unused context args
      // (failedStepName/errorLogs) for forward-compatibility.
      'no-unused-vars': [
        'error',
        {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        global: 'readonly',
      },
    },
  },
];
