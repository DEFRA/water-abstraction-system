'use strict'

class ExpandedError extends Error {
  /**
   * Custom error that allows additional data properties to be assigned to the error instance
   *
   * @param {String} message - Message that will be given to the error instance
   * @param {Object} data - An object containing the additional data properties to be assigned to the error instance
   */
  constructor (message, data) {
    super(message)

    for (const [key, value] of Object.entries(data)) {
      this[key] = value
    }
  }
}

module.exports = ExpandedError
