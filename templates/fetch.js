'use strict'

/**
 * @module __MODULENAME__
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
