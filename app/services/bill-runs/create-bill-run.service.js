'use strict'

/**
 * Creates a bill run based on the regionId & billing period provided
 * @module CreateBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')

/**
 * Create a new bill run
 *
 * @param {Object} regionId The regionId for the selected region
 * @param {Object} financialYearEndings Object that contains the from and to financial year endings
 * @param {Object} options Optional params to be overridden
 * @param {String} [options.batchType=supplementary] The type of bill run to create. Defaults to 'supplementary'
 * @param {String} [options.scheme=sroc] The applicable charging scheme. Defaults to 'sroc'
 * @param {String} [options.source=wrls] Where the bill run originated from. Records imported from NALD have the
 *  source 'nald'. Those created in the service use 'wrls'. Defaults to 'wrls'
 * @param {String} [options.externalId=null] The id of the bill run as created in the Charging Module
 * @param {String} [options.status=queued] The status that the bill run should be created with
 * @param {Number} [options.errorCode=null] Numeric error code
 *
 * @returns {Promise<module:BillRunModel>} The newly created bill run instance with the `.region` property populated
 */
async function go (regionId, financialYearEndings, options) {
  const { fromFinancialYearEnding, toFinancialYearEnding } = financialYearEndings
  const optionsData = _defaultOptions(options)

  const billRun = await BillRunModel.query()
    .insert({
      regionId,
      fromFinancialYearEnding,
      toFinancialYearEnding,
      ...optionsData
    })
    .returning('*')
    .withGraphFetched('region')

  return billRun
}

function _defaultOptions (option) {
  const defaults = {
    batchType: 'supplementary',
    scheme: 'sroc',
    source: 'wrls',
    externalId: null,
    status: 'queued',
    errorCode: null
  }

  return {
    ...defaults,
    ...option
  }
}

module.exports = {
  go
}
