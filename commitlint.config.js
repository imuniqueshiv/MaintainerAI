const commitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', 200],
    'footer-max-line-length': [1, 'always', 200],
    'header-max-length': [2, 'always', 100],
  },
}

export default commitlintConfig
