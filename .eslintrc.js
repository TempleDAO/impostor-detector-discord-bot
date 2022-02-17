module.exports = {
  root: true,
  env: {
    browser: false,
    es2021: true,
  },
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:mocha/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: ['import', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
