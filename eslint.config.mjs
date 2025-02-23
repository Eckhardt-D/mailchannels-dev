import config from '@antfu/eslint-config'

export default config({
  ignores: ['./coverage', './dist', 'tsconfig.json'],
  rules: {
    'antfu/no-top-level-await': 'off',
  },
})
