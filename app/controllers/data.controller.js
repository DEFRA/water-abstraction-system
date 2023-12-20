'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const SeedService = require('../services/data/seed/seed.service.js')
const TearDownService = require('../services/data/tear-down/tear-down.service.js')

async function seed (_request, h) {
  await SeedService.go()

  return h.response().code(204)
}

async function tearDown (_request, h) {
  await TearDownService.go()

  return h.response().code(204)
}

module.exports = {
  seed,
  tearDown
}
