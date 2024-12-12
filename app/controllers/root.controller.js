'use strict'

/**
 * Controller for / endpoints
 * @module RootController
 */

function index(_request, _h) {
  return { status: 'alive' }
}

module.exports = {
  index
}
