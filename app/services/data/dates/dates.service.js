/**
 * Returns dynamic dates used by the service, for example, current financial year and returns periods
 * @module DatesService
 */

import DetermineBillingPeriodsService from '../../bill-runs/determine-billing-periods.service.js'
import { determineCurrentFinancialYear, today } from '../../../lib/general.lib.js'
import {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} from '../../../lib/return-cycle-dates.lib.js'
import { determineUpcomingReturnPeriods } from '../../../lib/return-periods.lib.js'

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
export default function datesService() {
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
    annual: DetermineBillingPeriodsService('annual', currentFinancialYear.endDate.getFullYear()),
    supplementary: DetermineBillingPeriodsService('supplementary', currentFinancialYear.endDate.getFullYear()),
    twoPartTariff: DetermineBillingPeriodsService('two_part_tariff', currentFinancialYear.endDate.getFullYear()),
    twoPartSupplementary: DetermineBillingPeriodsService(
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
