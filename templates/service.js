'use strict'

/**
 * @module __MODULENAME__
 */

const __FETCH_NAME__ = require('__FETCH_PATH__')
const __PRESENTERNAME__ = require('__PRESENTER_PATH__')

/**
 * @returns {object} - The data formatted for the view template
 */
async function go() {
  const data = await __FETCH_NAME__.go()

  const pageData = __PRESENTERNAME__.go(data)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
