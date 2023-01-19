'use strict'

/**
 * Controller for / endpoints
 * @module RootController
 */

async function index (_request, _h) {
  return { status: 'alive' }
}

async function get (request, _h) {
  const date = await request.server.methods.getChargingModuleToken()

  return { date }
}

module.exports = {
  index,
  get
}
