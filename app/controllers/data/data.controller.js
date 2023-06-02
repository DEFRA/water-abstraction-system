'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const Boom = require('@hapi/boom')

const DbExportService = require('../../services/db-export/db-export.service.js')
const TearDownService = require('../../services/data/tear-down/tear-down.service.js')

async function tearDown (_request, h) {
  try {
    await TearDownService.go()

    return h.response().code(204)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

/**
 * Triggers export of all relevant tables to CSV and then uploads them to S3
 */
async function dbExport (_request, h) {
  DbExportService.go()

  return h.response().code(204)
}

module.exports = {
  tearDown,
  dbExport
}
