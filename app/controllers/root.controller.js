'use strict'

/**
 * Controller for / endpoints
 * @module RootController
 */

async function index (_request, _h) {
  return { status: 'alive' }
}
module.exports = {
  index
}
