'use strict'

/**
 * @module __MODULE_NAME__
 */

const __PRESENTER_NAME__ = require('__PRESENTER_PATH__')

/**
 * @returns {object} - The data formatted for the view template
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
