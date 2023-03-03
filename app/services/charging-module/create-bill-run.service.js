'use strict'

/**
 * Connects with the Charging Module to create a new bill run
 * @module ChargingModuleCreateBillRunService
 */

const RegionModel = require('../../models/water/region.model.js')
const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

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
  const region = await _getChargeRegionId(regionId)

  const result = await ChargingModuleRequestLib.post('v3/wrls/bill-runs', { region, ruleset })

  return result
}

// Gets the single-letter charge region code for the provided regionId UUID
async function _getChargeRegionId (regionId) {
  const result = await RegionModel.query()
    .select('chargeRegionId')
    .findOne('regionId', regionId)

  return result.chargeRegionId
}

module.exports = {
  go
}
