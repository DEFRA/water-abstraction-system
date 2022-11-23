'use strict'

/**
 * Controller for /test/supplementary endpoints
 * @module SupplementaryController
 */

const FindRegionService = require('../../services/supplementary-billing/find-region.service.js')
const SupplementaryService = require('../../services/supplementary-billing/supplementary.service.js')

class SupplementaryController {
  static async index (request, h) {
    const { regionId } = await FindRegionService.go(request.query.region)

    const result = await SupplementaryService.go(regionId)

    return h.response(result).code(200)
  }
}

module.exports = SupplementaryController
