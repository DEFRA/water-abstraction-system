'use strict'

/**
 * Controller for /return-logs/missing endpoints
 * @module ReturnLogsMissingController
 */

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

const ProcessMissingService = require('../services/return-logs/missing/process-missing.service.js')

async function process(_request, h) {
  ProcessMissingService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

module.exports = {
  process
}
