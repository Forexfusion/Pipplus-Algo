module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),  // ✅ correct plugin
    require('autoprefixer'),
  ],
}
