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
 * @param {module:ReviewLicenceModel} licence the data from review licence
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
    matchedReturns: _matchedReturns(licence[0].reviewReturns),
    unmatchedReturns: _unmatchedReturns(licence[0].reviewReturns),
    chargeData: _prepareChargeData(licence, billRun)
  }
}

function _accountName (billingAccount) {
  const accountAddress = billingAccount.billingAccountAddresses[0]

  if (accountAddress.company) {
    return accountAddress.company.name
  }

  return billingAccount.company.name
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

  return addressParts.filter((part) => {
    return part
  })
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
      issues: reviewChargeElement.issues.length > 0 ? reviewChargeElement.issues.split(', ') : '',
      billableReturns: `${reviewChargeElement.allocated} ML / ${reviewChargeElement.chargeElement.authorisedAnnualQuantity} ML`,
      returnVolume: _prepareReturnVolume(reviewChargeElement)
    })

    i++
  }
  return chargeElements
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

function _chargeElementCount (reviewChargeVersion) {
  const { reviewChargeReferences } = reviewChargeVersion

  const chargeElementCount = reviewChargeReferences.reduce((total, reviewChargeReference) => {
    return total + reviewChargeReference.reviewChargeElements.length
  }, 0)

  return chargeElementCount
}

function _checkStatusAndReturnTotal (returnLog) {
  const { returnStatus: status, allocated, quantity, underQuery } = returnLog

  let returnTotal
  let returnStatus = underQuery ? 'query' : status

  if (status === 'void' || status === 'received') {
    returnTotal = '/'
  } else if (status === 'due') {
    returnStatus = 'overdue'
    returnTotal = '/'
  } else {
    returnTotal = `${allocated} ML / ${quantity} ML`
  }

  return { returnStatus, returnTotal }
}

function _contactName (billingAccount) {
  const contact = billingAccount.billingAccountAddresses[0].contact

  if (contact) {
    return contact.$name()
  }

  return null
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _matchedReturns (returnLogs) {
  const matchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElements.length > 0) {
      const { returnStatus, returnTotal } = _checkStatusAndReturnTotal(returnLog)

      matchedReturns.push(
        {
          returnId: returnLog.returnId,
          reference: returnLog.returnReference,
          dates: _prepareDate(returnLog.startDate, returnLog.endDate),
          returnStatus,
          description: returnLog.description,
          purpose: returnLog.purposes[0].tertiary.description,
          returnTotal,
          issues: returnLog.issues.length > 0 ? returnLog.issues.split(', ') : ''
        }
      )
    }
  }

  return matchedReturns
}

function _prepareChargeData (licence, billRun) {
  const { reviewChargeVersions } = licence[0]
  const chargeData = []

  for (const reviewChargeVersion of reviewChargeVersions) {
    const chargePeriod = {
      startDate: reviewChargeVersion.chargePeriodStartDate,
      endDate: reviewChargeVersion.chargePeriodEndDate
    }

    chargeData.push({
      financialYear: _financialYear(billRun.toFinancialYearEnding),
      chargePeriodDate: _prepareDate(reviewChargeVersion.chargePeriodStartDate, reviewChargeVersion.chargePeriodEndDate),
      licenceHolderName: licence[0].licenceHolder,
      chargeElementCount: _chargeElementCount(reviewChargeVersion),
      billingAccountDetails: _billingAccountDetails(reviewChargeVersion.billingAccountDetails),
      chargeReferences: _chargeReferenceDetails(reviewChargeVersion, chargePeriod)
    })
  }

  return chargeData
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

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
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

function _unmatchedReturns (returnLogs) {
  const unmatchedReturns = []

  for (const returnLog of returnLogs) {
    if (returnLog.reviewChargeElements.length < 1) {
      unmatchedReturns.push(
        {
          returnId: returnLog.returnId,
          reference: returnLog.returnReference,
          dates: _prepareDate(returnLog.startDate, returnLog.endDate),
          returnStatus: returnLog.returnStatus,
          description: returnLog.description,
          purpose: returnLog.purposes[0].tertiary.description,
          total: `${returnLog.allocated} / ${returnLog.quantity} ML`,
          issues: returnLog.issues.length > 0 ? returnLog.issues.split(', ') : ''
        }
      )
    }
  }

  return unmatchedReturns
}

module.exports = {
  go
}
