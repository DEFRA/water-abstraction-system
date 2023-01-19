'use strict'

/**
 * Controller for / endpoints
 * @module RootController
 */

async function index (_request, _h) {
  return { status: 'alive' }
}

async function tokenSet (request, _h) {
  return { token: 'set' }
}

async function tokenGet (request, _h) {
  return { token: 'get' }
}

module.exports = {
  index,
  tokenSet,
  tokenGet
}
