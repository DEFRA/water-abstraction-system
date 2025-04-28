'use strict'

/**
 * @module __MODULE_NAME__
 */

/**
 * @returns {object} - The data
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
