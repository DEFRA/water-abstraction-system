'use strict'

/**
 * Checks if the given string starts with any of the special characters
 * given in the startCharacters array.
 *
 * @param {string} value - The string to check
 *
 * @returns {boolean} true if the string starts with any of the special characters, false otherwise
 */
function invalidStartCharacters(value) {
  const startCharacters = ['@', '(', ')', '=', '[', ']', '”', '\\', '/', '<', '>']

  return startCharacters.some((character) => {
    return value.startsWith(character)
  })
}

module.exports = {
  invalidStartCharacters
}
