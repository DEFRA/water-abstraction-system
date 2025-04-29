'use strict'

/**
 * Orchestrates presenting the data for `` page
 *
 * @module __MODULE_NAME__
 */

const __PRESENTER_NAME__ = require('__PRESENTER_PATH__')

/**
 * Orchestrates presenting the data for `` page
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go() {
  const pageData = __PRESENTER_NAME__.go()

  return {
    ...pageData
  }
}

module.exports = {
  go
}
