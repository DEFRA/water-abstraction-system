'use strict'

const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * A representation of the customers 'FetchCustomerService'
 *
 * @returns {object} A customer object
 */
function customer() {
  return {
    id: generateUUID(),
    name: 'Tyrell Corporation'
  }
}

module.exports = {
  customer
}
