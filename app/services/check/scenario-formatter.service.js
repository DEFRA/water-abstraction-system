'use strict'

/**
 * Formats the result of TwoPartService to match the scenario spreadsheet as closely as possible
 * @module AllocateReturnsService
 */

const { formatAbstractionDate } = require('../../presenters/base.presenter.js')

function go (licences) {
  return licences.map((licence) => {
    const {
      simpleId,
      id,
      licenceRef: reference,
      startDate,
      expiredDate,
      lapsedDate,
      revokedDate,
      issue,
      status,
      chargeVersions,
      returns
    } = licence
    console.log('🚀 ~ file: scenario-formatter.service.js:40 ~ returnlicences.map ~ licence:', licence)

    return {
      simpleId,
      id,
      reference,
      starts: startDate.toLocaleDateString('en-GB'),
      expires: expiredDate ? expiredDate.toLocaleDateString('en-GB') : '',
      lapses: lapsedDate ? lapsedDate.toLocaleDateString('en-GB') : '',
      revokes: revokedDate ? revokedDate.toLocaleDateString('en-GB') : '',
      status,
      issue,
      chargeVersions: _formatChargeVersions(chargeVersions),
      returns: _formatReturns(returns)
    }
  })
}

function _formatAbstractionPeriods (abstractionPeriods) {
  if (!abstractionPeriods) {
    return ''
  }

  return abstractionPeriods.map((period) => {
    const { startDate, endDate } = period

    return `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`
  })
}

function _formatChargeElements (chargeElements) {
  return chargeElements.map((chargeElement) => {
    const {
      simpleId,
      id,
      purpose,
      authorisedAnnualQuantity: authorised,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriods,
      allocatedQuantity: allocated,
      status,
      issues,
      returns
    } = chargeElement

    return {
      simpleId,
      id,
      purpose: `${purpose.description} | ${purpose.legacyId}`,
      authorised,
      absStart: formatAbstractionDate(abstractionPeriodStartDay, abstractionPeriodStartMonth),
      absEnd: formatAbstractionDate(abstractionPeriodEndDay, abstractionPeriodEndMonth),
      absPeriods: _formatAbstractionPeriods(abstractionPeriods),
      allocated,
      status,
      issues: issues.join(', '),
      returns
    }
  })
}

function _formatChargeReferences (chargeReferences) {
  return chargeReferences.map((chargeReference) => {
    const {
      simpleId,
      id,
      chargeCategory,
      volume: authorised,
      aggregate,
      chargeElements
    } = chargeReference

    return {
      simpleId,
      id,
      category: chargeCategory.reference,
      subsistence: chargeCategory.subsistenceCharge,
      authorised,
      aggregate,
      chargeElements: _formatChargeElements(chargeElements)
    }
  })
}

function _formatChargeVersions (chargeVersions) {
  return chargeVersions.map((chargeVersion) => {
    const {
      simpleId,
      id,
      startDate,
      endDate,
      chargePeriod,
      chargeReferences
    } = chargeVersion

    const chargePeriodStartDate = chargePeriod.startDate ? chargePeriod.startDate.toLocaleDateString('en-GB') : ''
    const chargePeriodEndDate = chargePeriod.endDate ? chargePeriod.endDate.toLocaleDateString('en-GB') : ''

    return {
      simpleId,
      id,
      starts: startDate.toLocaleDateString('en-GB'),
      ends: endDate ? endDate.toLocaleDateString('en-GB') : '',
      chargePeriod: `${chargePeriodStartDate} - ${chargePeriodEndDate}`,
      chargeReferences: _formatChargeReferences(chargeReferences)
    }
  })
}

function _formatReturns (returns) {
  return returns.map((returnRecord) => {
    const {
      simpleId,
      id,
      returnRequirement: requirement,
      description,
      startDate,
      endDate,
      dueDate,
      receivedDate,
      status,
      underQuery,
      nilReturn,
      purposes,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth,
      abstractionPeriods,
      quantity,
      allocatedQuantity: allocated,
      abstractionOutsidePeriod,
      issues,
      returnSubmissions,
      chargeElements
    } = returnRecord

    const formattedPurposes = purposes.map((purpose) => {
      return `${purpose.tertiary.description} | ${purpose.tertiary.code}`
    })

    const formattedLines = returnSubmissions[0]?.returnSubmissionLines?.map((line) => {
      const { simpleId, id, startDate, endDate, quantity, unallocated } = line

      return {
        simpleId,
        id,
        period: `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`,
        quantity,
        unallocated
      }
    })

    return {
      simpleId,
      id,
      requirement,
      status,
      description,
      starts: startDate.toLocaleDateString('en-GB'),
      ends: endDate.toLocaleDateString('en-GB'),
      due: dueDate.toLocaleDateString('en-GB'),
      received: receivedDate ? receivedDate.toLocaleDateString('en-GB') : '',
      underQuery,
      nilReturn,
      purpose: formattedPurposes,
      absStart: formatAbstractionDate(periodStartDay, periodStartMonth),
      absEnd: formatAbstractionDate(periodEndDay, periodEndMonth),
      absPeriods: _formatAbstractionPeriods(abstractionPeriods),
      quantity,
      allocated,
      abstractionOutsidePeriod,
      issues: issues.join(', '),
      lines: formattedLines,
      chargeElements
    }
  })
}

module.exports = {
  go
}
