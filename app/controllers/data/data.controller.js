'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const TearDownService = require('../../services/data/tear-down/tear-down.service.js')

async function tearDown (_request, h) {
  const result = await TearDownService.go()

  return h.response(result).code(200)
}

module.exports = {
  tearDown
}
