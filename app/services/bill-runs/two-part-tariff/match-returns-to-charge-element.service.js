'use strict'

/**
 * Matches the return logs to the charge element
 * @module MatchReturnsToChargeElementService
 */

const { periodsOverlap } = require('../../../lib/general.lib.js')

/**
 * Matches return logs to a charge element and adds the matching returns to the charge element
 *
 * @param {module:ChargeElementModel} chargeElement - The charge element to match return logs against
 * @param {module:ReturnLogModel[]} returnLogs - All return logs from the charge elements licence
 *
 * @returns {module:ReturnLogModel[]} Return logs that matched the charge element
 */
function go (chargeElement, returnLogs) {
  const matchingReturns = _matchReturns(chargeElement, returnLogs)
  if (matchingReturns.length > 0) {
    _addMatchingReturnsToElement(matchingReturns, chargeElement)
  }

  return matchingReturns
}

function _addMatchingReturnsToElement (matchingReturns, chargeElement) {
  matchingReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      allocatedQuantity: 0,
      returnId: matchedReturn.id
    }

    chargeElement.returnLogs.push(matchedReturnResult)
    matchedReturn.matched = true
  })
}

/**
 * Filters and returns logs that match a given charge element based on legacy ID and abstraction periods
 */
function _matchReturns (chargeElement, returnLogs) {
  const elementCode = chargeElement.purpose.legacyId
  const elementPeriods = chargeElement.abstractionPeriods

  return returnLogs.filter((returnLog) => {
    const returnPeriods = returnLog.abstractionPeriods

    const matchFound = returnLog.purposes.some((purpose) => {
      return purpose.tertiary.code === elementCode
    })

    if (!matchFound) {
      return false
    }

    return periodsOverlap(elementPeriods, returnPeriods)
  })
}

module.exports = {
  go
}
