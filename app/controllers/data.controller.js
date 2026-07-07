/**
 * Controller for /data endpoints
 * @module DataController
 */

import http2 from 'node:http2'
import DatesService from '../services/data/dates/dates.service.js'
import LoadService from '../services/data/load/load.service.js'
import SeedService from '../services/data/seed/seed.service.js'
import TearDownService from '../services/data/tear-down/tear-down.service.js'

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

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

export {
  dates,
  deduplicate,
  load,
  seed,
  tearDown
}
export default {
  dates,
  deduplicate,
  load,
  seed,
  tearDown
}
