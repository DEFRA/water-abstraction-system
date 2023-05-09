'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const TearDownService = require('../../services/data/tear-down/tear-down.service.js')

async function tearDown (_request, h) {
  await TearDownService.go()

  return h.response().code(204)
}

module.exports = {
  tearDown
}
