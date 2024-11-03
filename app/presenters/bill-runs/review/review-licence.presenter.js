'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const Big = require('big.js')

const { formatAbstractionPeriod, formatFinancialYear, formatLongDate } = require('../../base.presenter.js')
const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')

/**
 * Formats the review licence data ready for presenting in the review licence page
 *
 * @param {module:ReviewLicenceModel} reviewLicence - instance of the `ReviewLicenceModel` returned from
 * `FetchReviewLicenceService`
 *
 * @returns {object} page date needed for the review licence page
 */
function go (reviewLicence) {
  const {
    billRun,
    id: reviewLicenceId,
    licenceHolder,
    licenceId,
    licenceRef,
    progress,
    reviewChargeVersions,
    reviewReturns,
    status
  } = reviewLicence
  const { matchedReturns, unmatchedReturns } = _formatReviewReturns(reviewReturns)

  return {
    billRunId: billRun.id,
    chargeVersions: _chargeVersions(reviewChargeVersions, billRun.toFinancialYearEnding),
    elementsInReview: _elementsInReview(reviewChargeVersions),
    licenceHolder,
    licenceId,
    licenceRef,
    matchedReturns,
    pageTitle: `Licence ${licenceRef}`,
    progress,
    region: billRun.region.displayName,
    reviewLicenceId,
    status,
    unmatchedReturns
  }
}

function _billingAccountDetails (billingAccount) {
  return {
    billingAccountId: billingAccount.id,
    accountNumber: billingAccount.accountNumber,
    accountName: billingAccount.$accountName(),
    contactName: billingAccount.$contactName(),
    addressLines: billingAccount.$addressLines()
  }
}

function _chargeElements (reviewChargeElements, chargePeriod) {
  const numberOfElements = reviewChargeElements.length

  return reviewChargeElements.map((reviewChargeElement, index) => {
    const { amendedAllocated, chargeElement, id, issues, reviewReturns, status } = reviewChargeElement

    return {
      billableReturns: `${amendedAllocated} ML / ${chargeElement.authorisedAnnualQuantity} ML`,
      chargePeriods: _chargeElementChargePeriod(chargeElement, chargePeriod),
      returnVolumes: _chargeElementReturnVolumes(reviewReturns),
      description: chargeElement.description,
      elementCount: numberOfElements,
      elementIndex: index + 1,
      status,
      id,
      issues: issues.length > 0 ? issues.split(', ') : [''],
      purpose: chargeElement.purpose.description
    }
  })
}

function _chargeElementChargePeriod (chargeElement, chargePeriod) {
  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  return abstractionPeriods.map((abstractionPeriod) => {
    const { endDate, startDate } = abstractionPeriod

    return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
  })
}

function _chargeElementReturnVolumes (reviewReturns) {
  return reviewReturns.map((reviewReturn) => {
    const { quantity, returnReference, returnStatus } = reviewReturn

    if (returnStatus === 'due') {
      return `overdue (${returnReference})`
    }

    return `${quantity} ML (${returnReference})`
  })
}

function _chargeReferences (reviewChargeReferences, chargePeriod) {
  return reviewChargeReferences.map((reviewChargeReference) => {
    const { amendedAuthorisedVolume, chargeReference, reviewChargeElements, id } = reviewChargeReference
    const totalAllocated = _totalAllocated(reviewChargeElements)

    return {
      billableReturnsWarning: totalAllocated > amendedAuthorisedVolume,
      chargeCategory: `Charge reference ${chargeReference.chargeCategory.reference}`,
      chargeDescription: chargeReference.chargeCategory.shortDescription,
      id,
      chargeElements: _chargeElements(reviewChargeElements, chargePeriod),
      chargeReferenceLinkTitle: _chargeReferenceLinkTitle(reviewChargeReference),
      totalBillableReturns: `${totalAllocated} ML / ${amendedAuthorisedVolume} ML`
    }
  })
}

function _chargeReferenceLinkTitle (reviewChargeReference) {
  const { aggregate, chargeAdjustment } = reviewChargeReference

  if (aggregate !== 1 || chargeAdjustment !== 1) {
    return 'Change details'
  }

  return 'View details'
}

function _chargeVersionDescription (reviewChargeReferences) {
  const referenceCount = reviewChargeReferences.length
  const elementCount = reviewChargeReferences.reduce((total, reviewChargeReference) => {
    return total + reviewChargeReference.reviewChargeElements.length
  }, 0)

  const referenceText = referenceCount > 1 ? 'references' : 'reference'
  const elementText = elementCount > 1 ? 'elements' : 'element'

  return `${referenceCount} charge ${referenceText} with ${elementCount} two-part tariff charge ${elementText}`
}

function _chargeVersions (reviewChargeVersions, toFinancialYearEnding) {
  return reviewChargeVersions.map((reviewChargeVersion) => {
    const { chargePeriodStartDate, chargePeriodEndDate, chargeVersion, reviewChargeReferences } = reviewChargeVersion
    const chargePeriod = { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate }

    return {
      billingAccountDetails: _billingAccountDetails(chargeVersion.billingAccount),
      chargePeriod: `${formatLongDate(chargePeriod.startDate)} to ${formatLongDate(chargePeriod.endDate)}`,
      chargeReferences: _chargeReferences(reviewChargeReferences, chargePeriod),
      description: _chargeVersionDescription(reviewChargeReferences),
      financialPeriod: formatFinancialYear(toFinancialYearEnding)
    }
  })
}

function _elementsInReview (reviewChargeVersions) {
  // If the licence we are reviewing is linked to at least one charge element (via charge version -> charge reference ->
  // charge element) that has a status of 'review' then the licence is said to have a status of 'REVIEW'
  return reviewChargeVersions.some((reviewChargeVersion) => {
    const { reviewChargeReferences } = reviewChargeVersion

    return reviewChargeReferences.some((reviewChargeReference) => {
      const { reviewChargeElements } = reviewChargeReference

      return reviewChargeElements.some((reviewChargeElement) => {
        return reviewChargeElement.status === 'review'
      })
    })
  })
}

function _formatReviewReturns (reviewReturns) {
  const matchedReturns = []
  const unmatchedReturns = []

  reviewReturns.forEach((reviewReturn) => {
    const { description, endDate, issues, purposes, returnLog, returnId, returnReference, startDate } = reviewReturn
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnLog

    const formattedReviewReturn = {
      abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
      description,
      issues: issues.length > 0 ? issues.split(', ') : [''],
      purpose: purposes[0].tertiary.description,
      reference: returnReference,
      returnId,
      returnLink: _returnLink(reviewReturn),
      returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      returnStatus: _returnStatus(reviewReturn),
      returnTotal: _returnTotal(reviewReturn)
    }

    if (reviewReturn.reviewChargeElements.length > 0) {
      matchedReturns.push(formattedReviewReturn)
    } else {
      unmatchedReturns.push(formattedReviewReturn)
    }
  })

  return { matchedReturns, unmatchedReturns }
}

function _returnLink (reviewReturn) {
  const { returnId, returnStatus } = reviewReturn

  if (['due', 'received'].includes(returnStatus)) {
    return `/return/internal?returnId=${returnId}`
  }

  return `/returns/return?id=${returnId}`
}

function _returnStatus (reviewReturn) {
  const { returnStatus, underQuery } = reviewReturn

  if (returnStatus === 'due') {
    return 'overdue'
  }

  if (underQuery) {
    return 'query'
  }

  return reviewReturn.returnStatus
}

function _returnTotal (reviewReturn) {
  const { allocated, quantity, returnStatus } = reviewReturn

  if (['due', 'received'].includes(returnStatus)) {
    return '/'
  }

  return `${allocated} ML / ${quantity} ML`
}

function _totalAllocated (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    const { amendedAllocated } = reviewChargeElement

    return Big(total).plus(amendedAllocated).toNumber()
  }, 0)
}

module.exports = {
  go
}
