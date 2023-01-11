'use strict'

/**
 * Connects with the Charging Module to create a new bill run
 * @module ChargingModuleCreateBillRunService
 */

const ChargeModuleTokenService = require('./charge-module-token.service.js')
const RegionModel = require('../models/water/region.model.js')
const RequestLib = require('../lib/request.lib.js')

const servicesConfig = require('../../config/services.config.js')

/**
 * Sends a request to the Charging Module to create a new bill run and returns the result.
 *
 * @param {string} regionId
 * @param {string} ruleset
 *
 * @returns
 */
async function go (regionId, ruleset) {
  const url = new URL('/v3/wrls/bill-runs', servicesConfig.chargingModule.url)

  const authentication = await ChargeModuleTokenService.go()

  const options = await _options(regionId, ruleset, authentication)
  const result = await RequestLib.post(url.href, options)

  return _parseResult(result)
}

async function _options (regionId, ruleset, authentication) {
  const region = await _getChargeRegionId(regionId)

  return {
    headers: {
      authorization: `Bearer ${authentication.accessToken}`
    },
    body: {
      region,
      ruleset
    }
  }
}

// Gets the single-letter charge region id for the provided region id UUID
async function _getChargeRegionId (regionId) {
  const result = await RegionModel.query()
    .select('chargeRegionId')
    .findOne('regionId', regionId)

  return result.chargeRegionId
}

function _parseResult (result) {
  if (!result.succeeded) {
    // TODO: Return desired error response
    return 'NOPE'
  }

  const data = JSON.parse(result.response.body)

  return data.billRun
}

module.exports = {
  go
}
