'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module ReviewLicencePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

async function go (matchedReturns, unmatchedReturns, chargePeriods, billRun) {
  const pageData = {
    licenceRef: matchedReturns[0].licence.licenceRef,
    billRunId: billRun.id,
    status: 'Review',
    region: billRun.region.displayName
  }

  const formattedChargePeriods = _formatLicenceChargePeriods(chargePeriods)
  const preparedReturns = _formattingMatchedReturns(matchedReturns)
  const preparedUnmatchedReturns = _formattingUnmatchedReturns(unmatchedReturns)

  pageData.matchedReturns = preparedReturns
  pageData.chargePeriodDates = formattedChargePeriods
  pageData.unmatchedReturns = preparedUnmatchedReturns

  return pageData
}

function _formatLicenceChargePeriods (chargePeriods) {
  const formattedChargePeriods = []

  for (const chargePeriod of chargePeriods) {
    if (chargePeriod.startDate !== null) {
      const formattedDates = _formatChargePeriods(chargePeriod)

      formattedChargePeriods.push(formattedDates)
    }
  }

  return formattedChargePeriods
}

function _formattingUnmatchedReturns (unmatchedReturns) {
  const preparedUnmatchedReturns = []

  for (const unmatchedReturn of unmatchedReturns) {
    preparedUnmatchedReturns.push({
      reference: unmatchedReturn.reviewReturnResults.returnReference,
      dates: _date(unmatchedReturn),
      status: unmatchedReturn.reviewReturnResults.status,
      description: unmatchedReturn.reviewReturnResults.description,
      purpose: unmatchedReturn.reviewReturnResults.purposes[0].tertiary.description,
      total: `${unmatchedReturn.reviewReturnResults.allocated} ML / ${unmatchedReturn.reviewReturnResults.quantity} ML`
    })
  }

  return preparedUnmatchedReturns
}

function _formattingMatchedReturns (matchedReturns) {
  const preparedReturns = []

  for (const returnLog of matchedReturns) {
    const { status, total, allocated } = _checkStatusAndReturnTotal(returnLog)

    preparedReturns.push({
      reference: returnLog.reviewReturnResults.returnReference,
      dates: _date(returnLog),
      status,
      description: returnLog.reviewReturnResults.description,
      purpose: returnLog.reviewReturnResults.purposes[0].tertiary.description,
      total,
      allocated
    })
  }

  return preparedReturns
}

function _checkStatusAndReturnTotal (returnLog) {
  const allocated = _allocated(returnLog)

  if (returnLog.reviewReturnResults.status === 'completed') {
    return { status: returnLog.reviewReturnResults.status, total: `${returnLog.reviewReturnResults.allocated} ML / ${returnLog.reviewReturnResults.quantity} ML`, allocated }
  } else if (returnLog.reviewReturnResults.underQuery === true) {
    return { status: 'query', total: `${returnLog.reviewReturnResults.allocated} ML / ${returnLog.reviewReturnResults.quantity} ML`, allocated }
  } else if (returnLog.reviewReturnResults.status === 'received') {
    return { status: returnLog.reviewReturnResults.status, total: '/', allocated: 'Not processed' }
  } else if (returnLog.reviewReturnResults.status === 'due') {
    return { status: 'overdue', total: '/', allocated: 'Not processed' }
  } else {
    return { status: returnLog.reviewReturnResults.status, total: '/', allocated: 'Not processed' }
  }
}

function _formatChargePeriods (chargePeriod) {
  const start = formatLongDate(chargePeriod.startDate)
  const end = formatLongDate(chargePeriod.endDate)

  return `${start} to ${end}`
}

function _allocated (returnLog) {
  if (returnLog.reviewReturnResults.quantity > returnLog.reviewReturnResults.allocated) {
    return 'Over abstraction'
  } else if (returnLog.reviewReturnResults.quantity === returnLog.reviewReturnResults.allocated) {
    return 'Fully allocated'
  } else {
    return ''
  }
}

function _date (returnLog) {
  const startDate = formatLongDate(returnLog.reviewReturnResults.startDate)
  const endDate = formatLongDate(returnLog.reviewReturnResults.endDate)

  return `${startDate} to ${endDate}`
}

module.exports = {
  go
}
