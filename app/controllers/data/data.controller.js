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
async function dbExport (_request, _h) {
  global.GlobalNotifier.omg('Starting db export service ')

  try {
    await DbExportService.go()

    global.GlobalNotifier.omg('Finished export service')
    return { status: 'successful' }
  } catch (error) {
    global.GlobalNotifier.omfg(`Error: ${error.message}`)
    return { status: `Error: ${error.message}` }
  }
}

module.exports = {
  tearDown,
  dbExport
}
