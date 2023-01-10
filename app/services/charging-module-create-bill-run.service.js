'use strict'

/**
 * Connects with the Charging Module to create a new bill run
 * @module ChargingModuleCreateBillRunService
 */

const RequestLib = require('../lib/request.lib.js')
const RegionModel = require('../models/water/region.model.js')

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

  // TODO: Obtain cognito token using ChargingModuleTokenService

  const options = await _options(regionId, ruleset)
  const result = await RequestLib.post(url.href, options)

  return _parseResult(result)
}

async function _options (regionId, ruleset) {
  const region = await _getChargeRegionId(regionId)

  return {
    region,
    ruleset
  }
}

// Gets the single-letter charge region id for the provided region id UUID
async function _getChargeRegionId (regionId) {
  const result = await RegionModel.query()
    .where('regionId', regionId)
    .first()

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
