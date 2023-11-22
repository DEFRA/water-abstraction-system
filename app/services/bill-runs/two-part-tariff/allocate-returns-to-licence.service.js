'use strict'

/**
 * Do stuff
 * @module AllocateReturnsToLicenceService
 */

function go (licences) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          _matchAndAllocate(chargeElement, returns, chargeVersion.chargePeriod)

          // PERSIST element ???
        })
      })
    })

    // PERSIST returns
  })
}

function _chargeDatesOverlap (matchedLine, chargePeriod) {
  const { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate } = chargePeriod
  const { startDate: lineStartDate, endDate: lineEndDate } = matchedLine

  if (lineStartDate < chargePeriodEndDate && lineEndDate > chargePeriodEndDate) {
    return true
  }

  if (lineStartDate < chargePeriodStartDate && lineEndDate > chargePeriodStartDate) {
    return true
  }

  return false
}

function _checkReturnForIssues (returnRecord) {
  if (returnRecord.underQuery) {
    return true
  }

  if (returnRecord.status !== 'completed') {
    return true
  }

  if (returnRecord.versions.length === 0 || returnRecord.versions[0].lines.length === 0) {
    return true
  }

  if (returnRecord.versions[0].nilReturn) {
    return true
  }

  return false
}

function _matchAndAllocate (chargeElement, returns, chargePeriod) {
  const matchedReturns = _matchReturns(chargeElement, returns)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      returnId: matchedReturn.returnId,
      allocatedQuantity: 0
    }

    chargeElement.returns.push(matchedReturnResult)

    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) {
      if (_checkReturnForIssues(matchedReturn)) {
        return
      }

      const matchedLines = _matchLines(chargeElement, matchedReturn.versions[0].lines)

      if (matchedLines.length === 0) {
        return
      }

      matchedLines.forEach((matchedLine) => {
        const remainingAllocation = chargeElement.authorisedAnnualQuantity - chargeElement.allocatedQuantity
        if (remainingAllocation > 0) {
          // We default how much to allocate to what is unallocated on the line i.e. remaining >= line.unallocated
          let qtyToAllocate = matchedLine.unallocated

          // If what remains is actually less than the line we instead set qtyToAllocate to what remains
          if (remainingAllocation < matchedLine.unallocated) {
            qtyToAllocate = remainingAllocation
          }

          chargeElement.chargeDatesOverlap = _chargeDatesOverlap(matchedLine, chargePeriod)
          chargeElement.allocatedQuantity += qtyToAllocate
          matchedReturnResult.allocatedQuantity += qtyToAllocate

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
        }
      })
    }
  })
}

function _matchLines (chargeElement, returnLines) {
  return returnLines.filter((returnLine) => {
    if (returnLine.unallocated === 0) {
      return false
    }

    const { startDate, endDate } = returnLine
    return _periodsOverlap(chargeElement.abstractionPeriods, [{ startDate, endDate }])
  })
}

function _matchReturns (chargeElement, returns) {
  const elementCode = chargeElement.purpose.legacyId
  const elementPeriods = chargeElement.abstractionPeriods

  return returns.filter((record) => {
    const returnPeriods = record.abstractionPeriods

    const matchFound = record.purposes.some((purpose) => {
      return purpose.tertiary.code === elementCode
    })

    if (!matchFound) {
      return false
    }

    return _periodsOverlap(elementPeriods, returnPeriods)
  })
}

function _periodsOverlap (elementPeriods, returnPeriods) {
  for (const elementPeriod of elementPeriods) {
    const overLappingPeriods = returnPeriods.filter((returnPeriod) => {
      if (returnPeriod.startDate > elementPeriod.endDate || elementPeriod.startDate > returnPeriod.endDate) {
        return false
      }

      return true
    })

    if (overLappingPeriods.length) {
      return true
    }
  }

  return false
}

module.exports = {
  go
}
