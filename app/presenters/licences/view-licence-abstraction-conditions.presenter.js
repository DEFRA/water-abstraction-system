'use strict'

const util = require('util')

/**
 * Formats the licence data
 * @param {string} licence
 * @returns
 */
function go(licence) {
  console.log(util.inspect(licence, false, null, true /* enable colors */))

  return {
    pageTitle: 'Licence abstraction conditions',
    licenceRef: licence.licenceRef
  }
}

module.exports = {
  go
}
