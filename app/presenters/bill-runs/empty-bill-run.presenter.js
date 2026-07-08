/**
 * Formats the bill run data ready for presenting in the empty bill run page
 * @module EmptyBillRunPresenter
 */

import { formatFinancialYear, formatLongDate, titleCase } from '../base.presenter.js'
import { formatBillRunType, formatChargeScheme, generateBillRunTitle } from '../billing.presenter.js'

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {object} - the prepared bill run data to be passed to the empty bill run page
 */
function go(billRun) {
  const { batchType, billRunNumber, createdAt, id, region, scheme, status, summer, toFinancialYearEnding } = billRun

  return {
    backLink: '/system/bill-runs',
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    buttonLink: `/system/bill-runs/${id}/cancel`,
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: generateBillRunTitle(region.displayName, batchType, scheme, summer),
    region: titleCase(region.displayName)
  }
}

export { go }
export default {
  go
}
