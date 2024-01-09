'use strict'

/**
 * Prepares the return logs and charge elements and sorts the charge references ready for matching and allocating
 * @module PrepareLicencesForAllocationService
 */

const DetermineAbstractionPeriodService = require('../determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const FetchReturnLogsForLicenceService = require('./fetch-return-logs-for-licence.service.js')
const { periodsOverlap } = require('../../../lib/general.lib.js')

/**
 * For each licence finds returns for the billing period and prepares them and the licence's charge elements
 * ready to be matched and allocated to one another
 *
 * > Rather than create a copy of each licence and amend it we amend the licences in place. Hence this service
 * > has no return value
 * @param {Object[]} licences - The licences to prepare
 * @param {Object[]} billingPeriod - The period a bill run is being calculated for. Currently, this always equates to a
 * financial year, for example, 2022-04-01 to 2023-03-31
 */
async function go (licence, billingPeriod) {
  await _prepareReturnLogs(licence, billingPeriod)
  _prepareChargeVersions(licence, billingPeriod)
}

/**
 * Checks if a return has evidence of abstraction outside the return's abstraction periods
 *
 * Each line has a start and end date. If that period does not overlap one of the abstraction periods assigned to the
 * licence the return needs to be flagged as having water been abstracted outside the agreed abstraction period.
 *
 * @param {Object[]} returnAbstractionPeriods - Abstraction periods to compare
 * @param {Object} returnLine - Return line object with start and end date
 *
 * @returns {Boolean}
 */
function _abstractionOutsidePeriod (returnAbstractionPeriods, returnLine) {
  const { startDate, endDate } = returnLine

  return !periodsOverlap(returnAbstractionPeriods, [{ startDate, endDate }])
}

function _prepareChargeVersions (licence, billingPeriod) {
  const { chargeVersions } = licence

  chargeVersions.forEach((chargeVersion) => {
    const { chargeReferences } = chargeVersion

    _sortChargeReferencesBySubsistenceCharge(chargeReferences)
    chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    chargeReferences.forEach((chargeReference) => {
      const { chargeElements } = chargeReference

      _prepareChargeElementsForMatching(chargeElements, chargeVersion.chargePeriod)
    })
  })
}

function _prepareChargeElementsForMatching (chargeElements, chargePeriod) {
  chargeElements.forEach((chargeElement) => {
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

    chargeElement.returnLogs = []
    chargeElement.allocatedQuantity = 0
    chargeElement.abstractionPeriods = abstractionPeriods
  })
}

async function _prepareReturnLogs (licence, billingPeriod) {
  licence.returnLogs = await FetchReturnLogsForLicenceService.go(licence.licenceRef, billingPeriod)

  _prepReturnsForMatching(licence.returnLogs, billingPeriod)
}

function _prepReturnsForMatching (returnLogs, billingPeriod) {
  returnLogs.forEach((returnLog) => {
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth, returnSubmissions } = returnLog
    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    let quantity = 0
    let abstractionOutsidePeriod = false

    returnSubmissions[0]?.returnSubmissionLines.forEach((returnSubmissionLine) => {
      if (!abstractionOutsidePeriod) {
        abstractionOutsidePeriod = _abstractionOutsidePeriod(abstractionPeriods, returnSubmissionLine)
      }
      returnSubmissionLine.unallocated = returnSubmissionLine.quantity / 1000
      quantity += returnSubmissionLine.unallocated
    })

    returnLog.nilReturn = returnSubmissions[0]?.nilReturn ?? false
    returnLog.quantity = quantity
    returnLog.allocatedQuantity = 0
    returnLog.abstractionPeriods = abstractionPeriods
    returnLog.abstractionOutsidePeriod = abstractionOutsidePeriod
    returnLog.matched = false
  })
}

/**
 * Sorts charge references by their subsistence charge in descending order
 *
 * The rules for matching returns to charge elements require us to consider those charge elements assigned to the
 * charge reference with the highest subsistence charge first.
 *
 * Normally, we'd deal with the ordering of things in the original fetch service. But to do that in this case would have
 * meant either creating a complex Knex-based query instead of just using Objection.js or, looping through the results
 * both in `FetchChargeVersionsService` and here.
 *
 * @returns {Object[]} - Sorted array of charge references
 */
function _sortChargeReferencesBySubsistenceCharge (chargeReferences) {
  return chargeReferences.sort((firstChargeReference, secondChargeReference) => {
    const { subsistenceCharge: subsistenceChargeFirst } = firstChargeReference.chargeCategory
    const { subsistenceCharge: subsistenceChargeSecond } = secondChargeReference.chargeCategory

    if (subsistenceChargeFirst > subsistenceChargeSecond) {
      return -1
    }

    if (subsistenceChargeFirst < subsistenceChargeSecond) {
      return 1
    }

    return 0
  })
}

module.exports = {
  go
}
