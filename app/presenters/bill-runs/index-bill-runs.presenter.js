'use strict'

/**
 * Formats the summary data for each bill run for use in the /bill-runs page
 * @module IndexBillRunsPresenter
 */

const { formatLongDate, formatMoney, titleCase } = require('../base.presenter.js')
const { formatBillRunType } = require('../billing.presenter.js')

/**
 * Formats the summary data for each bill run for use in the /bill-runs page
 *
 * @param {module:BillRunModel[]} billRuns - The bill runs containing the data to be summarised for the view
 *
 * @returns {object[]} Each bill run summary formatted for use in the `index.njk` template for `/bill-runs`
 */
function go(billRuns) {
  return billRuns.map((billRun) => {
    const { batchType, billRunNumber, createdAt, id, netTotal, numberOfBills, region, scheme, summer, status } = billRun

    return {
      id,
      createdAt: formatLongDate(createdAt),
      link: _link(id, status, scheme),
      number: billRunNumber,
      numberOfBills,
      region: titleCase(region),
      scheme,
      status,
      total: _formatTotal(status, batchType, netTotal),
      type: formatBillRunType(batchType, scheme, summer)
    }
  })
}

function _formatTotal(status, batchType, netTotal) {
  if (status === 'review' && (batchType === 'two_part_tariff' || batchType === 'two_part_supplementary')) {
    return ''
  }

  return formatMoney(netTotal, true)
}

function _link(billRunId, status, scheme) {
  if (['cancel', 'processing', 'queued', 'sending'].includes(status)) {
    return null
  }

  if (status === 'review') {
    // Old PRESROC bill runs
    if (scheme === 'alcs') {
      return `/billing/batch/${billRunId}/two-part-tariff-review`
    }

    return `/system/bill-runs/review/${billRunId}`
  }

  return `/system/bill-runs/${billRunId}`
}

module.exports = {
  go
}
