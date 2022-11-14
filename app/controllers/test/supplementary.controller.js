'use strict'

const FindRegionService = require('../../services/test/find_region.service')
const SupplementaryService = require('../../services/test/supplementary.service.js')

class SupplementaryController {
  static async index (request, h) {
    const region = await FindRegionService.go(request.query.region)

    const result = await SupplementaryService.go(region.regionId)

    return h.response(result).code(200)
  }
}

module.exports = SupplementaryController
