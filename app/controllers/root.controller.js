'use strict'

/**
 * Controller for / endpoints
 * @module SupplementaryController
 */

async function index (_request, _h) {
  return { status: 'alive' }
}

module.exports = {
  index
}
