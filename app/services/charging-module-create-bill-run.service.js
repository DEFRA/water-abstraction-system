'use strict'

/**
 * Connects with the Charging Module to create a new bill run
 * @module ChargingModuleCreateBillRunService
 */

const ChargingModuleTokenService = require('./charging-module-token.service.js')
const RegionModel = require('../models/water/region.model.js')
const RequestLib = require('../lib/request.lib.js')

const servicesConfig = require('../../config/services.config.js')

/**
 * Sends a request to the Charging Module to create a new bill run and returns the result.
 *
 * @param {string} regionId The UUID of the region the bill run is to be created for
 * @param {string} ruleset The ruleset that the bill run is to be created for, either `sroc` or `presroc`
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the bill run creation request was successful
 * @returns {Object} result.response Details of the created bill run if successful; or the error response if not
 */
async function go (regionId, ruleset) {
  const url = new URL('/v3/wrls/bill-runs', servicesConfig.chargingModule.url)

  const authentication = await ChargingModuleTokenService.go()

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
  // Simply return the result as-is if we were unsuccessful
  if (!result.succeeded) {
    return result
  }

  const parsedBody = JSON.parse(result.response.body)

  return {
    succeeded: true,
    response: parsedBody.billRun
  }
}

module.exports = {
  go
}
