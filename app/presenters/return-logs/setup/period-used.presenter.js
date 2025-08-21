'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/period-used` page
 * @module PeriodUsedPresenter
 */

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

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    backLink: `/system/return-logs/setup/${sessionId}/single-volume`,
    caption: `Return reference ${returnReference}`,
    pageTitle: 'What period was used for this volume?',
    periodDateUsedOptions: periodDateUsedOptions ?? null,
    periodUsedFromDay: periodUsedFromDay ?? null,
    periodUsedFromMonth: periodUsedFromMonth ?? null,
    periodUsedFromYear: periodUsedFromYear ?? null,
    periodUsedToDay: periodUsedToDay ?? null,
    periodUsedToMonth: periodUsedToMonth ?? null,
    periodUsedToYear: periodUsedToYear ?? null,
    sessionId
  }
}

module.exports = {
  go
}
