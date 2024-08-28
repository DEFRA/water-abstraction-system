'use strict'

/**
 * Determines if a licence with a change in return log should be flagged for supplementary billing
 * @module DetermineReturnLogYearsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const { ref } = require('objection')

const SROC_START_DATE = new Date('2022-04-01')

/**
 * Determines if a licence with a change in return log should be flagged for supplementary billing.
 *
 * The service is passed the id of a return log and determines if it should be flagged for supplementary
 * billing. This is worked out based on the returns start date being after the SROC start date and if it has two part
 * tariff set to true. If they do, then flagForBilling is set to true.
 *
 * @param {string} returnLogId - The UUID for the charge version to fetch
 *
 * @returns {object} - An object containing the related licence, return start and end date and if the licence
 * should be flagged for two-part tariff supplementary billing
 */
async function go (returnLogId) {
  const { twoPartTariff, licence, endDate, startDate } = await _fetchReturnLog(returnLogId)

  const result = {
    licence,
    startDate,
    endDate,
    twoPartTariff,
    flagForBilling: false
  }

  if (startDate < SROC_START_DATE) {
    return result
  }

  // When we can support non two-part tariff billing flags we can remove this line
  result.flagForBilling = result.twoPartTariff

  return result
}

async function _fetchReturnLog (returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select([
      'id',
      'licenceRef',
      'startDate',
      'endDate',
      ref('metadata:isTwoPartTariff').castBool().as('twoPartTariff')
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'regionId'
      ])
    })
}

module.exports = {
  go
}
