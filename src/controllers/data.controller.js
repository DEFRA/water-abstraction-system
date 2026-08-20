/**
 * Controller for /data endpoints
 * @module DataController
 */

import http2 from 'node:http2'

import SeedService from '../services/data/seed/seed.service.js'

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

export async function seed(_request, h) {
  await SeedService()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}
