// postcss.config.js
module.exports = {
    plugins: {
      '@tailwindcss/postcss': {}, // ✅ Fix for Tailwind plugin error
      autoprefixer: {},           // ✅ Needed for compatibility with many CSS tools
    },
  };
  