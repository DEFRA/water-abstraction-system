'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review licence data for presentation
 *
 * @param {module:ReviewReturnResultModel} matchedReturns matched return logs for an individual licence
 * @param {module:ReviewReturnResultModel} unmatchedReturns unmatched return logs for an individual licence
 * @param {Object[]} chargePeriods chargePeriods with start and end date properties
 * @param {module:BillRunModel} billRun the data from the bill run
 * @param {String} licenceRef the reference for the licence
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review licence page
 */
function go (matchedReturns, unmatchedReturns, chargePeriods, billRun, licenceRef, chargeData) {
  return {
    licenceRef,
    billRunId: billRun.id,
    status: 'review',
    region: billRun.region.displayName,
    matchedReturns: _prepareMatchedReturns(matchedReturns),
    unmatchedReturns: _prepareUnmatchedReturns(unmatchedReturns),
    chargePeriodDates: _prepareLicenceChargePeriods(chargePeriods),
    chargeData: _prepareChargeData(chargeData)
  }
}

function _prepareChargeData (chargeData) {
  const preparedChargeData = []
  let index = 0

  for (const chargeVersion of chargeData) {
    const { chargePeriods, chargeReferences } = chargeVersion

    preparedChargeData.push({
      chargeVersion: chargeVersion.chargeVersionId,
      chargePeriodDate: `Charge period ${_prepareDate(chargePeriods.chargePeriodStartDate, chargePeriods.chargePeriodEndDate)}`
    })

    // console.log('preparedChargeData :', preparedChargeData)

    preparedChargeData[index].chargeReferences = []

    let referenceIndex = 0
    for (const chargeReference of chargeReferences) {
      const { chargeElements } = chargeReference

      preparedChargeData[index].chargeReferences.push({
        chargeCategory: `Charge reference ${chargeReference.chargeReferenceData?.chargeCategory.reference}`,
        chargeDescription: chargeReference.chargeReferenceData?.chargeCategory.shortDescription
      })

      preparedChargeData[index].chargeReferences[referenceIndex].chargeElements = []

      for (const chargeElement of chargeElements) {
        preparedChargeData[index].chargeReference[referenceIndex].chargeElements.push({

        })
      }

      referenceIndex++
    }
    console.log('preparedChargeData :', preparedChargeData)
    index++
  }

  return preparedChargeData
}

function _prepareLicenceChargePeriods (chargePeriods) {
  return chargePeriods.map((chargePeriod) => {
    const { startDate, endDate } = chargePeriod

    return _prepareDate(startDate, endDate)
  })
}

function _prepareUnmatchedReturns (unmatchedReturns) {
  return unmatchedReturns.map((unmatchedReturn) => {
    const { returnReference, status, description, purposes, quantity, startDate, endDate } = unmatchedReturn.reviewReturnResults

    return {
      reference: returnReference,
      dates: _prepareDate(startDate, endDate),
      status,
      description,
      purpose: purposes[0].tertiary.description,
      total: `${quantity} ML`
    }
  })
}

function _prepareMatchedReturns (matchedReturns) {
  return matchedReturns.map((matchedReturn) => {
    const { returnStatus, total } = _checkStatusAndReturnTotal(matchedReturn)
    const { returnReference, description, purposes, startDate, endDate } = matchedReturn.reviewReturnResults

    return {
      reference: returnReference,
      dates: _prepareDate(startDate, endDate),
      status: returnStatus,
      description,
      purpose: purposes[0].tertiary.description,
      total,
      allocated: _allocated(matchedReturn)
    }
  })
}

function _checkStatusAndReturnTotal (returnLog) {
  const { status, allocated, quantity, underQuery } = returnLog.reviewReturnResults

  let total
  let returnStatus = underQuery ? 'query' : status

  if (status === 'void' || status === 'received') {
    total = '/'
  } else if (status === 'due') {
    returnStatus = 'overdue'
    total = '/'
  } else {
    total = `${allocated} ML / ${quantity} ML`
  }

  return { returnStatus, total }
}

function _allocated (returnLog) {
  const { quantity, allocated, status, underQuery } = returnLog.reviewReturnResults
  if (underQuery) {
    return ''
  } else if (status === 'void' || status === 'received' || status === 'due') {
    return 'Not processed'
  } else if (quantity > allocated) {
    return 'Over abstraction'
  } else {
    return 'Fully allocated'
  }
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

module.exports = {
  go
}
