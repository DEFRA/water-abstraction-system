'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module ReviewLicencePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

async function go (matchedReturns, unmatchedReturns, chargePeriods, licence, billRun, status) {
  const pageData = {
    licenceRef: licence.licenceRef,
    billRunId: billRun.id,
    status,
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
      reference: unmatchedReturn.reviewReturnResult.returnReference,
      dates: _date(unmatchedReturn),
      status: unmatchedReturn.reviewReturnResult.status,
      description: unmatchedReturn.reviewReturnResult.description,
      purpose: unmatchedReturn.reviewReturnResult.purposes[0].tertiary.description,
      total: `${unmatchedReturn.reviewReturnResult.allocated} ML / ${unmatchedReturn.reviewReturnResult.quantity} ML`
    })
  }

  return preparedUnmatchedReturns
}

function _formattingMatchedReturns (matchedReturns) {
  const preparedReturns = []

  for (const returnLog of matchedReturns) {
    const { status, total, allocated } = _checkStatusAndReturnTotal(returnLog)

    preparedReturns.push({
      reference: returnLog.reviewReturnResult.returnReference,
      dates: _date(returnLog),
      status,
      description: returnLog.reviewReturnResult.description,
      purpose: returnLog.reviewReturnResult.purposes[0].tertiary.description,
      total,
      allocated
    })
  }

  return preparedReturns
}

function _checkStatusAndReturnTotal (returnLog) {
  const allocated = _allocated(returnLog)

  if (returnLog.reviewReturnResult.status === 'completed') {
    return { status: returnLog.reviewReturnResult.status, total: `${returnLog.reviewReturnResult.allocated} ML / ${returnLog.reviewReturnResult.quantity} ML`, allocated }
  } else if (returnLog.reviewReturnResult.underQuery === true) {
    return { status: 'query', total: `${returnLog.reviewReturnResult.allocated} ML / ${returnLog.reviewReturnResult.quantity} ML`, allocated }
  } else if (returnLog.reviewReturnResult.status === 'received') {
    return { status: returnLog.reviewReturnResult.status, total: '/', allocated: 'Not processed' }
  } else if (returnLog.reviewReturnResult.status === 'due') {
    return { status: 'overdue', total: '/', allocated: 'Not processed' }
  } else {
    return { status: returnLog.reviewReturnResult.status, total: '/', allocated: 'Not processed' }
  }
}

function _formatChargePeriods (chargePeriod) {
  const start = formatLongDate(chargePeriod.startDate)
  const end = formatLongDate(chargePeriod.endDate)

  return `${start} to ${end}`
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
