'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const { formatLongDate, formatAbstractionPeriod } = require('../../base.presenter.js')

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
function go (matchedReturns, unmatchedReturns, chargePeriods, billRun, licenceRef, licenceHolder, chargeData) {
  return {
    licenceRef,
    billRunId: billRun.id,
    status: 'review',
    region: billRun.region.displayName,
    matchedReturns: _prepareMatchedReturns(matchedReturns),
    unmatchedReturns: _prepareUnmatchedReturns(unmatchedReturns),
    chargePeriodDates: _prepareLicenceChargePeriods(chargePeriods),
    chargeData: _prepareChargeData(chargeData, licenceHolder, billRun)
  }
}

function _chargeVersionSummary (chargeVersion) {
  const { chargeReferences } = chargeVersion

  const chargeReferenceCount = chargeReferences.length
  const chargeElementCount = chargeReferences.reduce((total, chargeReference) => total + chargeReference.chargeElements.length, 0)

  const chargeReferenceSentence = `${chargeReferenceCount} charge reference${chargeReferenceCount !== 1 ? 's' : ''} with`
  const chargeElementSentence = `${chargeElementCount} Two-part tariff element${chargeElementCount !== 1 ? 's' : ''}`

  return `${chargeReferenceSentence} ${chargeElementSentence}`
}

function _prepareChargeData (chargeData, licenceHolder, billRun) {
  const preparedChargeData = []

  chargeData.forEach(async (chargeVersion, chargeVersionIndex) => {
    const { chargePeriods, chargeReferences } = chargeVersion
    console.log('chargePeriods.chargePeriodStartDate', chargePeriods.chargePeriodStartDate)

    preparedChargeData.push({
      financialYear: `Financial year ${_financialYear(billRun.toFinancialYearEnding)}`,
      chargePeriodDate: `Charge period ${await _prepareDate(chargePeriods.chargePeriodStartDate, chargePeriods.chargePeriodEndDate)}`,
      licenceHolderName: licenceHolder,
      chargeVersionSummary: _chargeVersionSummary(chargeVersion),
      // TO DO Billing Accounts
      billingAccountDetails: '',
      chargeVersion: chargeVersion.chargeVersionId,
      chargeReferences: []
    })

    chargeReferences.forEach(async (chargeReference, referenceIndex) => {
      const { chargeElements } = chargeReference
      console.log('Charge Reference Count', chargeReference)

      preparedChargeData[chargeVersionIndex].chargeReferences.push({
        chargeCategory: `Charge reference ${chargeReference.reference}`,
        chargeDescription: chargeReference.shortDescription,
        chargeElements: []
      })

      chargeElements.forEach(async (chargeElement, index) => {
        preparedChargeData[index].chargeReferences[referenceIndex].chargeElements.push({
          elementDescription: chargeElement.description,
          // TO DO Element status
          elementStatus: 'ready',
          elementDates: _chargeElementDates(chargeElement)
        })
      })
    })
  })

  return preparedChargeData
}

function _chargeElementDates (chargeElement) {
  const { abstractionPeriodStartDay, abstractionPeriodEndDay, abstractionPeriodStartMonth, abstractionPeriodEndMonth } = chargeElement

  return formatAbstractionPeriod(abstractionPeriodStartDay, abstractionPeriodStartMonth, abstractionPeriodEndDay, abstractionPeriodEndMonth)
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
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

async function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

module.exports = {
  go
}
