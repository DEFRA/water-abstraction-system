'use strict'

/**
 * Process the billing accounts for a given billing period and creates their supplementary two-part tariff bills
 * @module ProcessBillingPeriodService
 */

/**
 * Process the billing accounts for a given billing period and creates their supplementary two-part tariff bills
 *
 * @param {module:BillRunModel} _billRun - The two-part tariff supplementary bill run we need to process
 * @param {object} _billingPeriod - An object representing the financial year the bills will be for
 * @param {module:BillingAccountModel[]} _billingAccounts - The billing accounts to create bills for
 *
 * @returns {Promise<boolean>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go(_billRun, _billingPeriod, _billingAccounts) {
  throw Error('Not implemented')
}

module.exports = {
  go
}
