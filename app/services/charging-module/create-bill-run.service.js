'use strict'

/**
 * Connects with the Charging Module to create a new bill run
 * @module ChargingModuleCreateBillRunService
 */

const ChargingModuleTokenService = require('./token.service.js')
const RegionModel = require('../../models/water/region.model.js')
const RequestLib = require('../../lib/request.lib.js')

const servicesConfig = require('../../../config/services.config.js')

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
    json: {
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
  let response = result.response

  // If the request got a response from the Charging Module we will have a response body. If the request errored, for
  // example a timeout because the Charging Module is down, response will be the instance of the error thrown by Got.
  if (result.response.body) {
    const parsedBody = JSON.parse(result.response.body)
    response = result.succeeded ? parsedBody.billRun : parsedBody
  }

  return {
    succeeded: result.succeeded,
    response
  }
}

module.exports = {
  go
}
