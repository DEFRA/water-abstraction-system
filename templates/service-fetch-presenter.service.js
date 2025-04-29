'use strict'

/**
 * Orchestrates presenting the data for `` page
 *
 * @module __MODULE_NAME__
 */

const __FETCH_NAME__ = require('__FETCH_PATH__')
const __PRESENTER_NAME__ = require('__PRESENTER_PATH__')

/**
 * Orchestrates presenting the data for `` page
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go() {
  const data = await __FETCH_NAME__.go()

  const pageData = __PRESENTER_NAME__.go(data)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
