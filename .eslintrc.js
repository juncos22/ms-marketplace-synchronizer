module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    indent: ['error', 2],
    'no-tabs': 'off',
    'no-trailing-spaces': 'error',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
