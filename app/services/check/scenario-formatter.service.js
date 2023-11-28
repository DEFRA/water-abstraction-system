'use strict'

/**
 * Formats the result of TwoPartService to match the scenario spreadsheet as closely as possible
 * @module AllocateReturnsService
 */

const { formatAbstractionDate } = require('../../presenters/base.presenter.js')

function go (licences) {
  return licences.map((licence) => {
    const {
      id,
      licenceId,
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

    return {
      id,
      licenceId,
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
  return abstractionPeriods.map((period) => {
    const { startDate, endDate } = period

    return `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`
  })
}

function _formatChargeElements (chargeElements) {
  return chargeElements.map((chargeElement) => {
    const {
      id,
      chargePurposeId: chargeElementId,
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
      id,
      chargeElementId,
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
      id,
      chargeElementId: chargeReferenceId,
      chargeCategory,
      volume: authorised,
      aggregate,
      chargeElements
    } = chargeReference

    return {
      id,
      chargeReferenceId,
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
      id,
      chargeVersionId,
      startDate,
      endDate,
      chargePeriod,
      chargeReferences
    } = chargeVersion

    const chargePeriodStartDate = chargePeriod.startDate.toLocaleDateString('en-GB')
    const chargePeriodEndDate = chargePeriod.endDate.toLocaleDateString('en-GB')

    return {
      id,
      chargeVersionId,
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
      id,
      returnId,
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
      versions,
      chargeElements
    } = returnRecord

    const formattedPurposes = purposes.map((purpose) => {
      return `${purpose.tertiary.description} | ${purpose.tertiary.code}`
    })

    const formattedLines = versions[0]?.lines?.map((line) => {
      const { id, lineId, startDate, endDate, quantity, unallocated } = line

      return {
        id,
        lineId,
        period: `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`,
        quantity,
        unallocated
      }
    })

    return {
      id,
      returnId,
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
