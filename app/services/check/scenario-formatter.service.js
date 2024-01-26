'use strict'

/**
 * Formats the result of TwoPartService to match the scenario spreadsheet as closely as possible
 * @module AllocateReturnsService
 */

const { formatAbstractionDate } = require('../../presenters/base.presenter.js')

function go (licence, licenceIndex) {
  const {
    id,
    licenceRef: reference,
    startDate,
    expiredDate,
    lapsedDate,
    revokedDate,
    issue,
    status,
    chargeVersions,
    returnLogs
  } = licence

  const simpleId = `L${licenceIndex + 1}`

  const formattedReturns = _formatReturnLogs(returnLogs)

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
    chargeVersions: _formatChargeVersions(chargeVersions, formattedReturns, simpleId),
    returns: formattedReturns
  }
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

function _formatChargeElements (chargeElements, formattedReturns, chargeReferenceSimpleId) {
  return chargeElements.map((chargeElement, index) => {
    const {
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
      returnLogs: matchedReturns
    } = chargeElement

    const simpleId = `E${index + 1}-${chargeReferenceSimpleId}`
    const formattedReturnLogs = _formatChargeElementMatchedReturns(matchedReturns, formattedReturns)

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
      returns: formattedReturnLogs
    }
  })
}

function _formatChargeElementMatchedReturns (matchedReturns, formattedReturns) {
  return matchedReturns.map((matchedReturn) => {
    const lines = matchedReturn.lines ? matchedReturn.lines : []

    const matchingReturn = formattedReturns.find((formattedReturn) => formattedReturn.id === matchedReturn.returnId)
    lines.forEach((line) => {
      line.matchingLine = matchingReturn.lines.find((matchingReturnLine) => {
        return matchingReturnLine.id === line.id
      })
    })

    const formattedLines = lines.map((line) => {
      return {
        simpleId: line.matchingLine.simpleId,
        id: line.id,
        allocated: line.allocated
      }
    })

    return {
      simpleId: matchingReturn.simpleId,
      id: matchedReturn.returnId,
      allocatedQuantity: matchedReturn.allocatedQuantity,
      lines: formattedLines
    }
  })
}

function _formatChargeReferences (chargeReferences, formattedReturns, chargeVersionSimpleId) {
  return chargeReferences.map((chargeReference, index) => {
    const {
      id,
      chargeCategory,
      volume: authorised,
      aggregate,
      chargeElements
    } = chargeReference

    const simpleId = `R${index + 1}-${chargeVersionSimpleId}`

    return {
      simpleId,
      id,
      category: chargeCategory.reference,
      subsistence: chargeCategory.subsistenceCharge,
      authorised,
      aggregate: aggregate ?? 1,
      chargeElements: _formatChargeElements(chargeElements, formattedReturns, simpleId)
    }
  })
}

function _formatChargeVersions (chargeVersions, formattedReturns, licenceSimpleId) {
  return chargeVersions.map((chargeVersion, index) => {
    const {
      id,
      startDate,
      endDate,
      chargePeriod,
      chargeReferences
    } = chargeVersion

    const simpleId = `V${index + 1}-${licenceSimpleId}`
    const chargePeriodStartDate = chargePeriod.startDate ? chargePeriod.startDate.toLocaleDateString('en-GB') : ''
    const chargePeriodEndDate = chargePeriod.endDate ? chargePeriod.endDate.toLocaleDateString('en-GB') : ''

    return {
      simpleId,
      id,
      starts: startDate.toLocaleDateString('en-GB'),
      ends: endDate ? endDate.toLocaleDateString('en-GB') : '',
      chargePeriod: `${chargePeriodStartDate} - ${chargePeriodEndDate}`,
      chargeReferences: _formatChargeReferences(chargeReferences, formattedReturns, simpleId)
    }
  })
}

function _formatReturnLogs (returnLogs) {
  return returnLogs.map((returnLog, index) => {
    const {
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
    } = returnLog

    const simpleId = `T${index + 1}`

    const formattedPurposes = purposes.map((purpose) => {
      return `${purpose.tertiary.description} | ${purpose.tertiary.code}`
    })

    const formattedLines = returnSubmissions[0]?.returnSubmissionLines?.map((line, index) => {
      const { id, startDate, endDate, quantity, unallocated } = line

      return {
        simpleId: `L${index + 1}-${simpleId}`,
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
