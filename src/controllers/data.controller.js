/**
 * Controller for /data endpoints
 * @module DataController
 */

import http2 from 'node:http2'

import LoadService from '../services/data/load/load.service.js'
import SeedService from '../services/data/seed/seed.service.js'
import TearDownService from '../../../water-abstraction-acceptance-tests/tests/tear-down/tear-down.service.js'

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

export async function load(request, h) {
  const result = await LoadService(request.payload)

  return h.response(result).code(HTTP_STATUS_OK)
}

export async function seed(_request, h) {
  await SeedService()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}
