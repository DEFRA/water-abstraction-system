'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/period-used` page
 * @module PeriodUsedPresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatAbstractionPeriod } = require('../../base.presenter.js')

/**
 * Format data for the `/return-log/setup/{sessionId}/period-used` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const {
    id: sessionId,
    periodStartDay,
    periodStartMonth,
    periodEndDay,
    periodEndMonth,
    periodDateUsedOptions,
    returnReference,
    periodUsedFromDay,
    periodUsedFromMonth,
    periodUsedFromYear,
    periodUsedToDay,
    periodUsedToMonth,
    periodUsedToYear
  } = session

  // Determine the valid abstraction periods that overlap with the return period - this will be used to decide whether
  // or not the "default return period" option will be displayed
  const returnPeriod = { startDate: new Date(session.startDate), endDate: new Date(session.endDate) }
  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    returnPeriod,
    session.periodStartDay,
    session.periodStartMonth,
    session.periodEndDay,
    session.periodEndMonth
  )

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    backLink: { href: `/system/return-logs/setup/${sessionId}/single-volume`, text: 'Back' },
    pageTitle: 'What period was used for this volume?',
    pageTitleCaption: `Return reference ${returnReference}`,
    periodDateUsedOptions: periodDateUsedOptions ?? null,
    periodUsedFromDay: periodUsedFromDay ?? null,
    periodUsedFromMonth: periodUsedFromMonth ?? null,
    periodUsedFromYear: periodUsedFromYear ?? null,
    periodUsedToDay: periodUsedToDay ?? null,
    periodUsedToMonth: periodUsedToMonth ?? null,
    periodUsedToYear: periodUsedToYear ?? null,
    sessionId,
    returnReference,
    showDefaultAbstractionPeriod: abstractionPeriods.length > 0
  }
}

module.exports = {
  go
}
