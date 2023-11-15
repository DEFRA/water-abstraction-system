'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const CheckTwoPartService = require('../services/check/two-part.service.js')
const TwoPartTariffMatchAndAllocateService = require('../services/bill-runs/two-part-tariff/match-and-allocate.service.js')

async function twoPart (request, h) {
  const result = await CheckTwoPartService.go(request.params.naldRegionId, 'region')

  return h.response(result).code(200)
}

async function twoPartLicence (request, h) {
  const result = await CheckTwoPartService.go(request.params.licenceId, 'licence')

  return h.response(result).code(200)
}

async function twoPartReview (request, h) {
  const result = await TwoPartTariffMatchAndAllocateService.go(
    { billingBatchId: '41be6d72-701b-4252-90d5-2d38614b6282', regionId: 'ffea25c2-e577-4969-8667-b0eed899230d' },
    [{ startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }],
    request.params.licenceId
  )

  return h.response(result).code(200)
}

module.exports = {
  twoPart,
  twoPartLicence,
  twoPartReview
}
