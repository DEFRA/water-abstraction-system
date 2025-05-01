'use strict'

/**
 * Fetches
 *
 * @module __MODULE_NAME__
 */

/**
 * Fetches
 *
 * @returns {Promise<object>} - The data
 */
async function go() {
  const { rows } = await _fetch()

  return rows
}

async function _fetch() {
  return ''
}

module.exports = {
  go
}
