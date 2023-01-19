'use strict'

/**
 * Controller for / endpoints
 * @module RootController
 */

async function index (_request, _h) {
  return { status: 'alive' }
}

async function get (request, _h) {
  const token = await request.server.methods.getChargingModuleToken()

  return token
}

module.exports = {
  index,
  get
}
