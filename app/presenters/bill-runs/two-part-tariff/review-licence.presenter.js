'use strict'

/**
 * Formats the review licence data ready for presenting in the review licence page
 * @module ReviewLicencePresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review licence data for presentation
 *
 * @param {module:BillRunModel} billRun the data from the bill run
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review licence page
 */
function go (billRun, licence) {
  return {
    billRunId: billRun.id,
    region: billRun.region.displayName,
    licence: {
      licenceId: licence[0].licenceId,
      licenceRef: licence[0].licenceRef,
      status: licence[0].status,
      licenceHolder: licence[0].licenceHolder
    },
    chargePeriodDates: _prepareLicenceChargePeriods(licence),
    matchedReturns: _matchedReturns(licence[0].reviewReturns),
    unmatchedReturns: _unmatchedReturns(licence[0].reviewReturns),
    chargeData: _prepareChargeData(licence, billRun)
  }
}

function _chargeVersionSummary (reviewChargeVersion) {
  const { reviewChargeReferences } = reviewChargeVersion

  const chargeReferenceCount = reviewChargeReferences.length
  const chargeElementCount = reviewChargeReferences.reduce((total, reviewChargeReference) => total + reviewChargeReference.reviewChargeElements.length, 0)

  const chargeReferenceSentence = `${chargeReferenceCount} charge reference${chargeReferenceCount !== 1 ? 's' : ''} with`
  const chargeElementSentence = `${chargeElementCount} two-part tariff element${chargeElementCount !== 1 ? 's' : ''}`

  return `${chargeReferenceSentence} ${chargeElementSentence}`
}

function _prepareChargeData (licence, billRun) {
  const preparedChargeData = []

  const { reviewChargeVersions } = licence[0]
  for (const reviewChargeVersion of reviewChargeVersions) {
    const chargePeriod = {
      startDate: reviewChargeVersion.chargePeriodStartDate,
      endDate: reviewChargeVersion.chargePeriodEndDate
    }

    preparedChargeData.push({
      financialYear: `Financial year ${_financialYear(billRun.toFinancialYearEnding)}`,
      chargePeriodDate: `Charge period ${_prepareDate(reviewChargeVersion.chargePeriodStartDate, reviewChargeVersion.chargePeriodEndDate)}`,
      licenceHolderName: licence[0].licenceHolder,
      chargeVersionSummary: _chargeVersionSummary(reviewChargeVersion),
      billingAccountDetails: _billingAccountDetails(reviewChargeVersion.billingAccountDetails),
      chargeReferences: _chargeReferenceDetails(reviewChargeVersion, chargePeriod)
    })
  }

  return preparedChargeData
}

function _chargeReferenceDetails (reviewChargeVersion, chargePeriod) {
  const chargeReference = []

  const { reviewChargeReferences } = reviewChargeVersion

  for (const reviewChargeReference of reviewChargeReferences) {
    chargeReference.push({
      chargeCategory: `Charge reference ${reviewChargeReference.chargeReference.chargeCategory.reference}`,
      chargeDescription: reviewChargeReference.chargeReference.chargeCategory.shortDescription,
      totalBillableReturns: _totalBillableReturns(reviewChargeReference),
      chargeElements: _chargeElementDetails(reviewChargeReference, chargePeriod)
    })
  }

  return chargeReference
}

function _totalBillableReturns (reviewChargeReference) {
  const { reviewChargeElements } = reviewChargeReference

  let totalBillableReturns = 0
  let totalQuantity = 0
  for (const reviewChargeElement of reviewChargeElements) {
    totalBillableReturns += reviewChargeElement.allocated
    totalQuantity += reviewChargeElement.chargeElement.authorisedAnnualQuantity
  }

  return `${totalBillableReturns} ML / ${totalQuantity} ML`
}

function _chargeElementDetails (reviewChargeReference, chargePeriod) {
  const { reviewChargeElements } = reviewChargeReference

  const chargeElementLength = reviewChargeElements.length
  const chargeElements = []

  let i = 1
  for (const reviewChargeElement of reviewChargeElements) {
    chargeElements.push({
      elementNumber: `Element ${i} of ${chargeElementLength}`,
      elementStatus: reviewChargeElement.status,
      elementDescription: reviewChargeElement.chargeElement.description,
      dates: _prepareChargeElementDates(reviewChargeElement.chargeElement, chargePeriod),
      issues: reviewChargeElement.issues.split(', '),
      billableReturns: `${reviewChargeElement.allocated} ML / ${reviewChargeElement.chargeElement.authorisedAnnualQuantity} ML`,
      returnVolume: _prepareReturnVolume(reviewChargeElement)
    })

    i++
  }
  return chargeElements
}

function _prepareReturnVolume (reviewChargeElement) {
  const { reviewReturns } = reviewChargeElement
  const returnVolumes = []

  if (reviewReturns) {
    reviewReturns.forEach((reviewReturn) => {
      returnVolumes.push(`${reviewReturn.quantity} ML (${reviewReturn.returnReference})`)
    })
  } else {
    return ''
  }

  return returnVolumes
}

function _prepareChargeElementDates (chargeElement, chargePeriod) {
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

  let dates

  // Need to sort if the dates are more than 1
  if (abstractionPeriods.length === 1) {
    dates = _prepareDate(abstractionPeriods[0].startDate, abstractionPeriods[0].endDate)
  }

  return dates
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _billingAccountDetails (billingAccount) {
  return {
    billingAccountId: billingAccount.id,
    accountNumber: billingAccount.accountNumber,
    accountName: _accountName(billingAccount),
    contactName: _contactName(billingAccount),
    addressLines: _addressLines(billingAccount)
  }
}

function _addressLines (billingAccount) {
  const { address } = billingAccount.billingAccountAddresses[0]

  const addressParts = [
    address.address1,
    address.address2,
    address.address3,
    address.address4,
    address.address5,
    address.address6,
    address.postcode,
    address.country
  ]

  return addressParts.filter((part) => part)
}

function _contactName (billingAccount) {
  const contact = billingAccount.billingAccountAddresses[0].contact

  if (contact) {
    return contact.$name()
  }

  return null
}

function _accountName (billingAccount) {
  const accountAddress = billingAccount.billingAccountAddresses[0]

  if (accountAddress.company) {
    return accountAddress.company.name
  }

  return billingAccount.company.name
}

function _prepareLicenceChargePeriods (licence) {
  const { reviewChargeVersions } = licence[0]
  const chargePeriodDates = []

  for (const reviewChargeVersion of reviewChargeVersions) {
    const startDate = reviewChargeVersion.chargePeriodStartDate
    const endDate = reviewChargeVersion.chargePeriodEndDate

    const dates = _prepareDate(startDate, endDate)
    chargePeriodDates.push(dates)
  }

  return chargePeriodDates
}

function _matchedReturns (returnLogs) {
  const matchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElements.length > 0) {
      const { returnStatus, total } = _checkStatusAndReturnTotal(returnLog)

      matchedReturns.push(
        {
          returnId: returnLog.returnId,
          reference: returnLog.returnReference,
          dates: _prepareDate(returnLog.startDate, returnLog.endDate),
          status: returnStatus,
          description: returnLog.description,
          purpose: returnLog.purposes[0].tertiary.description,
          total,
          issues: returnLog.issues.split(', ')
        }
      )
    }
  }

  return matchedReturns
}

function _unmatchedReturns (returnLogs) {
  const unmatchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElements.length < 1) {
      unmatchedReturns.push(
        {
          returnId: returnLog.returnId,
          reference: returnLog.returnReference,
          dates: _prepareDate(returnLog.startDate, returnLog.endDate),
          status: returnLog.returnStatus,
          description: returnLog.description,
          purpose: returnLog.purposes[0].tertiary.description,
          total: `${returnLog.quantity} ML`,
          issues: returnLog.issues.split(', ')
        }
      )
    }
  }

  return unmatchedReturns
}

function _checkStatusAndReturnTotal (returnLog) {
  const { returnStatus: status, allocated, quantity, underQuery } = returnLog

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

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

module.exports = {
  go
}
