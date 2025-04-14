module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir : __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-inferrable-types': ['error', {
      ignoreParameters: false,
      ignoreProperties: false,
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-empty-interface': ['error', {
      allowSingleExtends: false,
    }],
    'object-curly-spacing': ['error', 'always'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'max-classes-per-file': 'off',
    'no-plusplus': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/return-await': 'off',
    'no-console': 'error',
    'import/no-cycle': 'off',
    'max-len': ['error', { 'code': 200 }],
    'no-restricted-syntax': 'off',
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'sibling',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '@app/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '**/*.service',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '**/*.constants',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '**/*.utils',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ]
  },
};
