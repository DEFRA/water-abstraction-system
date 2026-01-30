'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = require('node:http2').constants

const DatesService = require('../services/data/dates/dates.service.js')
const LoadService = require('../services/data/load/load.service.js')
const SeedService = require('../services/data/seed/seed.service.js')
const TearDownService = require('../services/data/tear-down/tear-down.service.js')

async function dates(_request, h) {
  const pageData = DatesService.go()

  return h.response(pageData).code(HTTP_STATUS_OK)
}

async function deduplicate(_request, h) {
  return h.view('data/deduplicate.njk', {
    pageTitle: 'De-duplicate a licence'
  })
}

async function load(request, h) {
  const result = await LoadService.go(request.payload)

  return h.response(result).code(HTTP_STATUS_OK)
}

async function seed(_request, h) {
  await SeedService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function tearDown(_request, h) {
  await TearDownService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

module.exports = {
  dates,
  deduplicate,
  load,
  seed,
  tearDown
}
