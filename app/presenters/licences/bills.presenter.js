/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module BillsPresenter
 */

import { formatLongDate, formatMoney } from '../base.presenter.js'
import { formatBillRunType } from '../billing.presenter.js'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 *
 * @param {object[]} bills - The licence's bills
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
export default function bills(bills, licence) {
  const { id: licenceId, licenceRef } = licence

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    bills: _bills(licenceId, bills),
    pageTitle: 'Bills',
    pageTitleCaption: `Licence ${licenceRef}`
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
      billingAccountLink: `/system/billing-accounts/${billingAccountId}?licence-id=${licenceId}`,
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
