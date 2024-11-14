'use strict'

/**
 * @module DetermineBillLicenceFlagsService
 */

const BillModel = require('../../../models/bill.model.js')

/**
 * Comment
 * @param {*} billId
 * @returns
 */
async function go (billId) {
  const { billRun, billLicences } = await _fetchBill(billId)
  const result = []

  for (const billLicence of billLicences) {
    const { licenceId, licence } = billLicence

    // Set the flags to what they currently are on the licence
    let flagForSrocSupplementary = licence.includeInSrocBilling
    let flagForPreSrocSupplementary = licence.includeInPresrocBilling === 'yes'
    let flagForTwoPartTariffSupplementary = false

    if (billRun.batchType === 'two_part_tariff' && billRun.scheme === 'sroc') {
      flagForTwoPartTariffSupplementary = true
    } else {
      if (billRun.scheme === 'alcs') {
        flagForPreSrocSupplementary = true
      } else {
        flagForSrocSupplementary = true
      }
    }

    result.push({
      licenceId,
      regionId: licence.regionId,
      startDate: new Date(`${billRun.toFinancialYearEnding - 1}-04-01`),
      endDate: new Date(`${billRun.toFinancialYearEnding}-03-31`),
      flagForPreSrocSupplementary,
      flagForSrocSupplementary,
      flagForTwoPartTariffSupplementary
    })
  }

  return result
}

async function _fetchBill (billLicenceId) {
  return BillModel.query()
    .findById(billLicenceId)
    .select('billRunId')
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder.select([
        'id',
        'batchType',
        'scheme',
        'toFinancialYearEnding'
      ])
    })
    .withGraphFetched('billLicences')
    .modifyGraph('billLicences', (builder) => {
      builder.select([
        'id',
        'licenceId'
      ])
    })
    .withGraphFetched('billLicences.licence')
    .modifyGraph('billLicences.licence', (builder) => {
      builder.select([
        'regionId',
        'includeInSrocBilling',
        'includeInPresrocBilling'
      ])
    })
}

module.exports = {
  go
}
