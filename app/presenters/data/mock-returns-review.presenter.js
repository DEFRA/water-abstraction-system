'use strict'

/**
 * Formats the response for the GET `/data/mock/{returns-review}` endpoint
 * @module MockReturnsReviewPresenter
 */

const { capitalize, formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')
const DetermineChargePeriodService = require('../../services/billing/supplementary/determine-charge-period.service.js')

const ISSUE_DESCRIPTIONS = {
  10: 'No returns received',
  20: 'Checking query',
  30: 'Returns received but not processed',
  40: 'Some returns IDs not received',
  50: 'Returns received late',
  60: 'Over abstraction',
  70: 'No returns received',
  80: 'Too early to bill',
  90: 'Overlap of charge dates',
  100: 'No matching charge element'
}

function go (billRunInfo, reviewDataByLicence) {
  const response = {
    ..._transformBillRunInfo(billRunInfo),
    counts: {
      errored: 0,
      ready: 0
    },
    erroredLicences: [],
    readyLicences: []
  }

  reviewDataByLicence.forEach((licence) => {
    _transformLicence(licence)

    if (licence.errored) {
      response.counts.errored += 1
      response.erroredLicences.push(licence)
    } else {
      response.counts.ready += 1
      response.readyLicences.push(licence)
    }
  })

  return response
}

function _determineChargePeriod (startYear, endYear, licence, result) {
  const billingPeriod = {
    startDate: new Date(startYear, 3, 1),
    endDate: new Date(endYear, 2, 31)
  }
  const { chargeVersionStartDate: startDate, chargeVersionEndDate: endDate } = result

  const dummyChargeVersion = {
    startDate,
    endDate,
    licence
  }

  const chargePeriod = DetermineChargePeriodService.go(dummyChargeVersion, billingPeriod)

  return `${formatLongDate(chargePeriod.startDate)} to ${formatLongDate(chargePeriod.endDate)}`
}

function _determineLicenceIssue (twoPartTariffStatuses) {
  if (twoPartTariffStatuses.length === 0) {
    return ''
  }

  const uniqueStatuses = [...new Set(twoPartTariffStatuses)]

  if (uniqueStatuses.length === 1) {
    return _twoPartTariffStatusDescription(uniqueStatuses[0])
  }

  return 'Multiple errors'
}

function _transformBillRunInfo (billRunInfo) {
  const { billingBatchId, billRunNumber, dateCreated, batchType, scheme, regionName } = billRunInfo

  return {
    billingBatchId,
    billRunNumber,
    dateCreated: formatLongDate(dateCreated),
    region: capitalize(regionName),
    billRunType: capitalize(batchType),
    chargeScheme: scheme === 'sroc' ? 'Current' : 'Old'
  }
}

function _transformLicence (licence) {
  const twoPartTariffStatuses = []

  licence.returnsEdited = licence.returnsEdited ? 'Yes' : ''

  licence.financialYears.forEach((financialYear) => {
    const { startYear, endYear } = financialYear
    financialYear.chargeElements = []

    financialYear.resultsMatchedByFinancialYear.forEach((result) => {
      if (result.twoPartTariffStatus) {
        twoPartTariffStatuses.push(result.twoPartTariffStatus)
      }

      const chargePeriod = _determineChargePeriod(startYear, endYear, licence, result)
      const chargeElement = _transformResultToChargeElement(result, chargePeriod)
      financialYear.chargeElements.push(chargeElement)
    })

    delete financialYear.resultsMatchedByFinancialYear
  })

  licence.issue = _determineLicenceIssue(twoPartTariffStatuses)

  delete licence.dates
}

function _transformResultToChargeElement (result, chargePeriod) {
  const {
    calculatedVolume,
    description,
    invoiceAccountNumber,
    loss,
    purpose,
    source,
    season,
    twoPartTariffStatus,
    volume,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth,
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    authorisedAnnualQuantity: authorisedQty,
    billableAnnualQuantity: billableQty
  } = result

  return {
    issue: _twoPartTariffStatusDescription(twoPartTariffStatus),
    billableReturns: `${volume}Ml`,
    reportedReturns: `${calculatedVolume}Ml`,
    edited: volume !== calculatedVolume,
    billingAccount: invoiceAccountNumber,
    purpose: capitalize(purpose),
    description,
    chargePeriod,
    abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
    authorisedQuantity: authorisedQty ? `${authorisedQty}Ml authorised` : 'Authorised not set',
    billableQuantity: billableQty ? `${authorisedQty}Ml billable` : 'Billable not set',
    source: capitalize(source),
    season: capitalize(season),
    loss: capitalize(loss)
  }
}

function _twoPartTariffStatusDescription (statusCode) {
  const description = ISSUE_DESCRIPTIONS[statusCode]

  if (description) {
    return description
  }

  return null
}

module.exports = {
  go
}
