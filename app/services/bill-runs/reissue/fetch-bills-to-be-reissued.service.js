'use strict'

/**
 * Fetches bills to be reissued
 * @module FetchBillsToBeReissuedService
 */

const BillModel = require('../../../models/bill.model.js')

/**
 * Takes a region and fetches sroc bills in that region marked for reissuing, along with their transactions
 *
 * @param {string} regionId - The uuid of the region
 *
 * @returns {Promise<module:BillModel[]>} An array of bills to be reissued
 */
async function go (regionId) {
  try {
    const result = await BillModel.query()
      .select(
        'bills.id',
        'bills.externalId',
        'bills.financialYearEnding',
        'bills.billingAccountId',
        'bills.accountNumber',
        'bills.originalBillId'
      )
      .where('bills.flaggedForRebilling', true)
      .joinRelated('billRun')
      .where('billRun.regionId', regionId)
      .where('billRun.scheme', 'sroc')
      .withGraphFetched('billLicences.transactions')
      .modifyGraph('billLicences', (builder) => {
        builder.select(
          'licenceRef',
          'licenceId'
        )
      })

    return result
  } catch (error) {
    // If getting bills errors then we log the error and return an empty array; the db hasn't yet been modified at
    // this stage so we can simply move on to the next stage of processing the bill run.

    global.GlobalNotifier.omfg(
      'Could not fetch reissue bills',
      { region: regionId },
      error
    )

    return []
  }
}

module.exports = {
  go
}
