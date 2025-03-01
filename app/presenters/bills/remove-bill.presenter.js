'use strict'

/**
 * Formats data for the confirm remove a bill page
 * @module RemoveBillPresenter
 */

const { formatFinancialYear, formatLongDate, formatMoney, titleCase } = require('../base.presenter.js')
const { formatBillRunType, formatChargeScheme } = require('../billing.presenter.js')

/**
 * Formats data for the confirm remove a bill page
 *
 * @param {module:BillModel} bill - an instance of `BillModel` with associated billing data
 *
 * @returns {object} - the prepared bill summary data to be passed to the confirm remove a bill page
 */
function go(bill) {
  const { id: billId, billingAccount, billLicences, billRun } = bill

  const { billRunNumber, billRunStatus, billRunType, chargeScheme, dateCreated, financialYear, region } =
    _billRunSummary(billRun)

  const accountNumber = billingAccount.accountNumber
  const licences = _licences(billLicences)
  const licencesText = licences.includes(',') ? 'Licences' : 'Licence'

  return {
    accountName: billingAccount.$accountName(),
    accountNumber,
    billId,
    billRunNumber,
    billRunStatus,
    billRunType,
    chargeScheme,
    dateCreated,
    financialYear,
    licences,
    licencesText,
    pageTitle: _pageTitle(accountNumber),
    region,
    supplementaryMessage: _supplementaryMessage(licencesText),
    total: formatMoney(bill.netAmount, true)
  }
}

function _billRunSummary(billRun) {
  const { batchType, billRunNumber, createdAt, region, scheme, status, summer, toFinancialYearEnding } = billRun

  return {
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region: titleCase(region.displayName)
  }
}

function _licences(billLicences) {
  const licenceReferences = billLicences.map((billLicence) => {
    return billLicence.licenceRef
  })

  return licenceReferences.join(', ')
}

function _pageTitle(accountName) {
  return `You're about to remove the bill for ${accountName} from the bill run`
}

function _supplementaryMessage(licencesText) {
  return `The ${licencesText.toLowerCase()} will go into the next supplementary bill run.`
}

module.exports = {
  go
}
