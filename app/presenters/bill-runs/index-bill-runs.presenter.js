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
 * @param {string} busyResult - The state of busy bill runs; 'cancelling', 'building', 'both', or 'none'
 *
 * @returns {Promise<object>} The view data for the bill runs page
 */
function go(billRuns, busyResult) {
  return {
    billRuns: _billRuns(billRuns),
    notification: _notification(busyResult),
    pageTitle: 'View a bill run'
  }
}

function _billRuns(billRuns) {
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

function _notification(busyResult) {
  if (busyResult === 'both') {
    return {
      text: 'Please wait for these bill runs to finish before creating another one.',
      titleText: 'Busy building and cancelling'
    }
  }

  if (busyResult === 'building') {
    return {
      text: 'Please wait for this bill run to finish building before creating another one.',
      titleText: 'Busy building'
    }
  }

  if (busyResult === 'cancelling') {
    return {
      text: 'Please wait for this bill run to finish cancelling before creating another one.',
      titleText: 'Busy cancelling'
    }
  }
}

module.exports = {
  go
}
