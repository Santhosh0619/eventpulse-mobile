module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    // We use TypeScript for prop validation, not prop-types.
    'react/prop-types': 'off',
    // babel-preset-expo enables the automatic JSX runtime — no React import needed.
    'react/react-in-jsx-scope': 'off',
    // Inline styles are common in RN; allow but the design system is preferred.
    'react-native/no-inline-styles': 'off',
    // `void promise` is our intentional fire-and-forget marker.
    'no-void': 'off',
    // React Navigation options (headerRight/tabBarIcon) legitimately pass
    // element-returning functions as props.
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.expo/',
    'coverage/',
    'babel.config.js',
    'jest.config.js',
    'metro.config.js',
  ],
}
