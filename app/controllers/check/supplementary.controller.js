'use strict'

/**
 * Controller for /test/supplementary endpoints
 * @module SupplementaryController
 */

const SupplementaryDataService = require('../../services/check/supplementary-data.service.js')

async function index (request, h) {
  const result = await SupplementaryDataService.go(request.query.region)

  return h.response(result).code(200)
}

module.exports = {
  index
}
