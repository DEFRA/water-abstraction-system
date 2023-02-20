'use strict'

/**
 * Confirms the billing periods, licences and charge versions used to generate an SROC supplementary bill run
 * @module SupplementaryDataService
 */

const BillingPeriodService = require('../supplementary-billing/billing-period.service.js')
const CreateTransactionsService = require('../supplementary-billing/create-transactions.service.js')
const FetchChargeVersionsService = require('../supplementary-billing/fetch-charge-versions.service.js')
const FetchLicencesService = require('../supplementary-billing/fetch-licences.service.js')
const FetchRegionService = require('../supplementary-billing/fetch-region.service.js')
const SupplementaryDataPresenter = require('../../presenters/check/supplementary-data.presenter.js')

async function go (naldRegionId) {
  const region = await FetchRegionService.go(naldRegionId)
  const billingPeriods = BillingPeriodService.go()
  const billingPeriodFinancialYearEnding = billingPeriods[0].endDate.getFullYear()
  const licences = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

  // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
  // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
  // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
  // This is why we are only passing through the first billing period; we know there is only one!
  const chargeVersions = await FetchChargeVersionsService.go(region.regionId, billingPeriods[0])

  _addTransactionLines(billingPeriods, chargeVersions)

  return _response({ billingPeriods, licences, chargeVersions })
}

function _addTransactionLines (billingPeriods, chargeVersions) {
  const billingPeriod = billingPeriods[0]

  for (const chargeVersion of chargeVersions) {
    if (chargeVersion.chargeElements) {
      chargeVersion.transactionLines = CreateTransactionsService.go(billingPeriod, chargeVersion.chargeElements)
    }
  }
}

function _response (data) {
  return SupplementaryDataPresenter.go(data)
}

module.exports = {
  go
}
