'use strict'

/**
 * Formats the response for the GET `/data/mock/{returns-review}` endpoint
 * @module MockReturnsReviewPresenter
 */

const { capitalize, formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')

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
    const twoPartTariffStatuses = []

    licence.returnsEdited = licence.returnsEdited ? 'Yes' : ''

    licence.financialYears.forEach((financialYear) => {
      financialYear.chargeElements = []

      financialYear.resultsMatchedByFinancialYear.forEach((result) => {
        if (result.twoPartTariffStatus) {
          twoPartTariffStatuses.push(result.twoPartTariffStatus)
        }

        financialYear.chargeElements.push(_transformResultToChargeElement(result))
      })
      delete financialYear.resultsMatchedByFinancialYear
    })

    licence.issue = _determineLicenceIssue(twoPartTariffStatuses)

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

function _transformResultToChargeElement (result) {
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
    chargePeriod: '',
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
