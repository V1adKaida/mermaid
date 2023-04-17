require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'vue/require-default-prop': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-undef': false,
  },
  globals: {
    _: true
  }
}
