'use strict'

/**
 * Controller for /bill-runs/create endpoints
 * @module BillRunsCreateController
 */

const InitiateSessionService = require('../services/bill-runs/setup/initiate-session.service.js')

async function setup (_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/bill-runs/setup/${session.id}/type`)
}

module.exports = {
  setup
}
