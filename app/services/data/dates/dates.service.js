'use strict'

/**
 * Returns dynamic dates used by the service, for example, current financial year and returns periods
 * @module DatesService
 */

const DetermineBillingPeriodsService = require('../../bill-runs/determine-billing-periods.service.js')
const { determineCurrentFinancialYear, today } = require('../../../lib/general.lib.js')
const {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} = require('../../../lib/return-cycle-dates.lib.js')
const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')

/**
 * Returns dynamic dates used by the service, for example, current financial year and returns periods
 *
 * This was built to support water-abstraction-acceptance-tests. Often, a test requires us to seed data dynamically, to
 * support behaviour in the service.
 *
 * A good example is bill runs, where we are generally working in the current financial year, so we need to know what
 * that is.
 *
 * Another is when sending return invites and reminders. Due return logs need to exist for the current return periods
 * the UI will display to the user.
 *
 * Rather than duplicate the logic to determine these dates in the acceptance tests, we built this endpoint to provide
 * them.
 *
 * @returns {object} an object containing the current billing and return periods, plus the current financial year dates
 */
function go() {
  const [firstReturnPeriod, secondReturnPeriod] = determineUpcomingReturnPeriods(today())
  const currentSummerReturnCycle = {
    startDate: determineCycleStartDate(true),
    endDate: determineCycleEndDate(true),
    dueDate: determineCycleDueDate(true)
  }
  const currentWinterReturnCycle = {
    startDate: determineCycleStartDate(false),
    endDate: determineCycleEndDate(false),
    dueDate: determineCycleDueDate(false)
  }
  const currentFinancialYear = determineCurrentFinancialYear()
  const billingPeriods = {
    annual: DetermineBillingPeriodsService.go('annual', currentFinancialYear.endDate.getFullYear()),
    supplementary: DetermineBillingPeriodsService.go('supplementary', currentFinancialYear.endDate.getFullYear()),
    twoPartTariff: DetermineBillingPeriodsService.go('two_part_tariff', currentFinancialYear.endDate.getFullYear()),
    twoPartSupplementary: DetermineBillingPeriodsService.go(
      'two_part_supplementary',
      currentFinancialYear.endDate.getFullYear()
    )
  }

  return {
    billingPeriods,
    currentFinancialYear,
    currentSummerReturnCycle,
    currentWinterReturnCycle,
    firstReturnPeriod,
    secondReturnPeriod
  }
}

module.exports = {
  go
}
