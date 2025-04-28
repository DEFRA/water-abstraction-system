'use strict'

/**
 * @module __MODULENAME__
 */

const __PRESENTERNAME__ = require('__PRESENTER_PATH__')

/**
 * @returns {object} - The data formatted for the view template
 */
function go() {
  const pageData = __PRESENTERNAME__.go()
  return pageData
}

module.exports = {
  go
}
