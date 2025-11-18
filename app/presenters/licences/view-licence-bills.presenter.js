'use strict'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module ViewLicenceBillsPresenter
 */

const { formatLongDate, formatMoney } = require('../base.presenter.js')
const { formatBillRunType } = require('../billing.presenter.js')

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 *
 * @param {object} licence - The id and licence ref of the licence
 * @param {object[]} bills - The licence's bills
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence, bills, auth) {
  const { id: licenceId, licenceRef } = licence

  return {
    bills: _bills(licenceId, bills),
    pageTitle: 'Bills',
    pageTitleCaption: `Licence ${licenceRef}`,
    roles: _roles(auth)
  }
}

function _bills(licenceId, bills) {
  return bills.map((bill) => {
    const {
      accountNumber,
      billingAccountId,
      billRun,
      createdAt,
      credit,
      financialYearEnding,
      id: billId,
      netAmount
    } = bill

    return {
      accountNumber,
      billingAccountId,
      billingAccountLink: _billingAccountLink(billingAccountId, licenceId),
      billId,
      billNumber: _formatBillNumber(bill),
      billRunType: formatBillRunType(billRun.batchType, billRun.scheme, billRun.summer),
      credit,
      dateCreated: formatLongDate(createdAt),
      financialYearEnding,
      total: formatMoney(netAmount)
    }
  })
}

function _billingAccountLink(billingAccountId, licenceId) {
  if (FeatureFlagsConfig.enableBillingAccountView) {
    return `/system/billing-accounts/${billingAccountId}?licence-id=${licenceId}`
  }

  return `/billing-accounts/${billingAccountId}`
}

function _formatBillNumber(bill) {
  if (bill.invoiceNumber) {
    return bill.invoiceNumber
  }

  if (bill.deminimis) {
    return 'De minimis bill'
  }

  if (bill.legacyId) {
    return 'NALD revised bill'
  }

  if (bill.netAmount === 0) {
    return 'Zero value bill'
  }

  return ''
}

function _roles(auth) {
  return auth.credentials.roles.map((role) => {
    return role.role
  })
}

module.exports = {
  go
}
