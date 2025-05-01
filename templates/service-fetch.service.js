'use strict'

/**
 * Orchestrates presenting the data for `` page
 *
 * @module __MODULE_NAME__
 */

const __FETCH_NAME__ = require('__FETCH_PATH__')

/**
 * Orchestrates presenting the data for `` page
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go() {
  const data = await __FETCH_NAME__.go()

  return data
}

module.exports = {
  go
}
