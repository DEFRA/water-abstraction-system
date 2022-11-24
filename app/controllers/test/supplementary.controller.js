'use strict'

/**
 * Controller for /test/supplementary endpoints
 * @module SupplementaryController
 */

const SupplementaryService = require('../../services/supplementary-billing/supplementary.service.js')

class SupplementaryController {
  static async index (request, h) {
    const result = await SupplementaryService.go(request.query.region)

    return h.response(result).code(200)
  }
}

module.exports = SupplementaryController
