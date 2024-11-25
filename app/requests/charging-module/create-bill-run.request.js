'use strict'

/**
 * Connects with the Charging Module to create a new bill run
 * @module CreateBillRunRequest
 */

const RegionModel = require('../../models/region.model.js')
const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Sends a request to the Charging Module to create a new bill run and returns the result.
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/CreateBillRun | API docs} for more
 * details
 *
 * @param {string} regionId - The UUID of the region the bill run is to be created for
 * @param {string} ruleset - The ruleset that the bill run is to be created for, either `sroc` or `presroc`
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(regionId, ruleset) {
  const region = await _getChargeRegionId(regionId)

  const result = await ChargingModuleRequest.post('v3/wrls/bill-runs', { region, ruleset })

  return result
}

/**
 * Gets the single-letter charge region code for the provided regionId UUID
 *
 * @private
 */
async function _getChargeRegionId(regionId) {
  const result = await RegionModel.query().findById(regionId).select('chargeRegionId')

  return result.chargeRegionId
}

module.exports = {
  send
}
