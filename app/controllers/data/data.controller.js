'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const Boom = require('@hapi/boom')

const ExportService = require('../../services/data/export/export.service.js')
const SeedService = require('../../services/data/seed/seed.service.js')
const TearDownService = require('../../services/data/tear-down/tear-down.service.js')

/**
 * Triggers export of all relevant tables to CSV and then uploads them to S3
 *
 * > Has to be called something other than 'export' because export is a reserved word
 */
async function exportDb (_request, h) {
  ExportService.go()

  return h.response().code(204)
}

async function seed (_request, h) {
  try {
    await SeedService.go()

    return h.response().code(204)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function tearDown (_request, h) {
  try {
    await TearDownService.go()

    return h.response().code(204)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

module.exports = {
  exportDb,
  seed,
  tearDown
}
