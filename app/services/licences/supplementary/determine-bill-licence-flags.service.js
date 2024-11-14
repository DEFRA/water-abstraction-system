'use strict'

/**
 * @module DetermineBillLicenceFlagsService
 */

const BillLicenceModel = require('../../../models/bill-licence.model.js')

/**
 * Comment
 * @param {*} billLicenceId
 * @returns
 */
async function go (billLicenceId) {
  const { licence, bill, licenceId } = await _fetchBillLicence(billLicenceId)

  // Set the flags to what they currently are on the licence
  let flagForSrocSupplementary = licence.includeInSrocBilling
  let flagForPreSrocSupplementary = licence.includeInPresrocBilling === 'yes'
  let flagForTwoPartTariffSupplementary = false

  if (bill.billRun.batchType === 'two_part_tariff' && bill.billRun.scheme === 'sroc') {
    flagForTwoPartTariffSupplementary = true
  } else {
    if (bill.billRun.scheme === 'alcs') {
      flagForPreSrocSupplementary = true
    } else {
      flagForSrocSupplementary = true
    }
  }

  const result = {
    licenceId,
    regionId: licence.regionId,
    startDate: new Date(`${bill.billRun.toFinancialYearEnding - 1}-04-01`),
    endDate: new Date(`${bill.billRun.toFinancialYearEnding}-03-31`),
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    flagForTwoPartTariffSupplementary
  }

  return result
}

async function _fetchBillLicence (billLicenceId) {
  return BillLicenceModel.query()
    .findById(billLicenceId)
    .select('licenceId')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'regionId',
        'includeInSrocBilling',
        'includeInPresrocBilling'
      ])
    })
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('bill.billRun')
    .modifyGraph('bill.billRun', (builder) => {
      builder.select([
        'id',
        'batchType',
        'scheme',
        'toFinancialYearEnding'
      ])
    })
}

module.exports = {
  go
}
