'use strict'

/**
 * Calculates authorised and billable days for a given charge reference
 * @module CalculateAuthorisedAndBillableDaysService
 */

const { determineAbstractionPeriods } = require('../../lib/abstraction-period.lib.js')
const ConsolidateDateRangesService = require('./consolidate-date-ranges.service.js')

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

/**
 * Returns the authorised and billable days for a given charge reference based on its abstraction periods
 *
 * In WRLS the charge element, linked to a charge version via the charge reference, holds the abstraction period
 * information. The abstraction period is the time when a licensee is permitted to abstract water. They are held as a
 * start and end day and month, for example 1 Apr to 31 Oct. They do not have years because the intent is they are the
 * same period no matter what year it is.
 *
 * **Authorised** days is how much of the billing period overlaps with the abstraction period. **Billable** days is how
 * much of the charge period overlaps with the abstraction period (see params for explanations of billable and charge
 * periods).
 *
 * Calculating these values is complicated by the fact a charge reference may have multiple abstraction periods. Added
 * to that abstraction periods do not intersect nicely with billing or charge periods. The abstraction period might
 * start or end outside of the billing period, and so apply twice! For example, 1 Jan to 30 Jun intersects twice with a
 * billing period of 2022-04-01 to 2023-03-31.
 *
 * - **1 Jan 2022 to 30 Jun 2022** intersects as 1 Apr 2022 to 30 Jun 2022
 * - **1 Jan 2023 to 30 Jun 2023** intersects as 1 Jan 2023 to 31 Mar 2023
 *
 * The number of days the abstraction period intersects either the billing or charge period is where we get our 'days'
 * from. The final complication is we cannot double count. If 2 charge elements have abstraction periods that overlap we
 * must only count one of them. For example
 *
 * - charge element 1 has **1 Jan to 30 Jun**
 * - charge element 2 has **1 May to 31 Oct**
 *
 * They overlap 1 May to 30 Jun. To get our days we summate the result for each abstraction period and have to ensure we
 * only count this once.
 *
 * So, a charge element's abstraction dates might result in 2 relevant abstraction periods. A charge reference might
 * have multiple charge elements. But we must return a single **Authorised** and **Billable** days calculation. This
 * problem is what this service tackles.
 *
 * @param {{startDate: Date, endDate: Date}} chargePeriod - Charge period is determined as the overlap between a charge
 * version's start and end dates, and the billing period's (financial year) start and end dates. So, when the charge
 * version and billing period are compared the charge period's start date is the latest of the two, and the end date is
 * the earliest of their end dates
 * @param {{startDate: Date, endDate: Date}} billingPeriod - The period a bill run is being calculated for. Currently,
 * this always equates to a financial year, for example, 2022-04-01 to 2023-03-31
 * @param {module:ChargeReferenceModel} chargeReference - A charge version can have multiple charge references, though
 * each will have a different reference, for example, 4.1.10. Each reference can have multiple charge elements and it's
 * these that hold the abstraction period data
 *
 * @returns {object} An object containing an `authorisedDays` and `billableDays` property
 */
function go(chargePeriod, billingPeriod, chargeReference) {
  const { chargeElements } = chargeReference

  const authorisedAbstractionPeriods = []
  const billableAbstractionPeriods = []

  chargeElements.forEach((chargeElement) => {
    const {
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth
    } = chargeElement

    authorisedAbstractionPeriods.push(
      ...determineAbstractionPeriods(billingPeriod, startDay, startMonth, endDay, endMonth)
    )
    billableAbstractionPeriods.push(
      ...determineAbstractionPeriods(chargePeriod, startDay, startMonth, endDay, endMonth)
    )
  })

  return {
    authorisedDays: _consolidateAndCalculate(billingPeriod, authorisedAbstractionPeriods),
    billableDays: _consolidateAndCalculate(chargePeriod, billableAbstractionPeriods)
  }
}

/**
 * Calculates the numbers of days in an abstraction overlap period (inclusive)
 *
 * We uses JavaScript's
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime|getTime()}
 * function to give us the start and end time in milliseconds. We then take the difference and divide by how many
 * milliseconds are in a day. This gives us the number of days.
 *
 * Finally, we add 1 to the result to make it inclusive of the last day. This is because our dates are set at
 * midnight which means `endDate.getTime()` is the time at `endDate 00:00:00`.
 *
 * @param {object} abstractionOverlapPeriod - a start and end date representing the part of the abstraction period that
 * overlaps the reference period
 *
 * @returns {number} the length of the period in days (inclusive)
 *
 * @private
 */
function _calculateDays(abstractionOverlapPeriod) {
  const difference = abstractionOverlapPeriod.endDate.getTime() - abstractionOverlapPeriod.startDate.getTime()

  // ceil() always rounds up, even if the result is 1.1 (rounds to 2). We add 1 to make the calculation inclusive of
  // the last day
  return Math.ceil(difference / ONE_DAY_IN_MILLISECONDS) + 1
}

/**
 * Calculates the period that an abstraction period overlaps the reference period
 *
 * Before we can work out either the authorised or billable days, we first need to work out what part of the abstraction
 * period overlaps.
 *
 * The simplest way to look at this is that the overlapping period is the latest start date and the earliest end date.
 *
 * So, for example, the abstraction period has been calculated as 01-JAN-2022 to 30-JUN-2022 and our reference is the
 * billing period (ie. 31-MAR-2022 to 01-APR-2023). Then the overlap period is 01-APR-2022 to 30-JUN-2022.
 *
 * Other scenarios we have to handle are
 *
 * - 01-JUL-2022 to 31-DEC-2022 - overlap is also 01-JUL-2022 to 31-DEC-2022 because it falls inside the billing period
 * - 01-NOV-2022 to 31-MAY-2023 - overlap is 01-NOV-2022 to 31-MAR-2023
 *
 * @param {object} referencePeriod - either the billing period or charge period
 * @param {object} abstractionPeriod - an object containing `startDate` and `endDate` date representing the abstraction
 *  period relative to the reference
 *
 * @returns {object} an object with a start and end date representing the part of the abstraction period that overlaps
 *  the reference period
 *
 * @private
 */
function _calculateAbstractionOverlapPeriod(referencePeriod, abstractionPeriod) {
  const latestStartDateTimestamp = Math.max(abstractionPeriod.startDate, referencePeriod.startDate)
  const earliestEndDateTimestamp = Math.min(abstractionPeriod.endDate, referencePeriod.endDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
}

function _consolidateAndCalculate(referencePeriod, abstractionsPeriods) {
  const consolidatedAbstractionPeriods = ConsolidateDateRangesService.go(abstractionsPeriods)

  const totalDays = consolidatedAbstractionPeriods.reduce((acc, abstractionPeriod) => {
    const abstractionOverlapPeriod = _calculateAbstractionOverlapPeriod(referencePeriod, abstractionPeriod)

    return acc + _calculateDays(abstractionOverlapPeriod)
  }, 0)

  return totalDays
}

module.exports = {
  go
}
