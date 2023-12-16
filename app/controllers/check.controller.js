'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const CheckTwoPartService = require('../services/check/two-part.service.js')

async function twoPart (request, h) {
  const result = await CheckTwoPartService.go(request.params.naldRegionId, 'region')

  return h.response(result).code(200)
}

async function twoPartLicence (request, h) {
  const result = await CheckTwoPartService.go(request.params.licenceId, 'licence')

  return h.response(result).code(200)
}

module.exports = {
  twoPart,
  twoPartLicence
}
