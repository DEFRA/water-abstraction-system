'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module LicenceReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

async function go (returnLogs) {
  const preparedReturns = []

  for (const returnLog of returnLogs) {
    preparedReturns.push({
      reference: returnLog.reviewReturnResult.returnReference,
      dates: _date(returnLog),
      status: returnLog.reviewReturnResult.status,
      description: returnLog.reviewReturnResult.description,
      purpose: returnLog.reviewReturnResult.purposes[0].tertiary.description,
      total: `${returnLog.reviewReturnResult.allocated} ML / ${returnLog.reviewReturnResult.quantity} ML`,
      allocated: _allocated(returnLog)
    })
  }

  return preparedReturns
}

function _allocated (returnLog) {
  if (returnLog.reviewReturnResult.quantity > returnLog.reviewReturnResult.allocated) {
    return 'Over abstraction'
  } else if (returnLog.reviewReturnResult.quantity === returnLog.reviewReturnResult.allocated) {
    return 'Fully allocated'
  } else {
    return ''
  }
}

function _date (returnLog) {
  const startDate = formatLongDate(returnLog.reviewReturnResult.startDate)
  const endDate = formatLongDate(returnLog.reviewReturnResult.endDate)

  return `${startDate} to ${endDate}`
}

module.exports = {
  go
}
