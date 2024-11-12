'use strict'

module.exports = [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs"
    },
    rules: {
      // Enforce braces around the function body of arrow functions
      "arrow-body-style": ["error", "always"]
    }
  }
]
