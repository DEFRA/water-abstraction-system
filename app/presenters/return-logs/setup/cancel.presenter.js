'use strict'

/**
 * Formats data for the `/return-logs/setup/{sessionId}/cancel` page
 * @module CancelPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the `/return-logs/setup/{sessionId}/cancel` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} The page data needed by the view template
 */
function go(session) {
  const {
    endDate,
    id: sessionId,
    periodEndDay,
    periodEndMonth,
    periodStartDay,
    periodStartMonth,
    purposes,
    receivedDate,
    returnLogId,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff
  } = session

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    backLink: { href: `/system/return-logs/setup/${sessionId}/check`, text: 'Back' },
    pageTitle: 'You are about to cancel this return submission',
    pageTitleCaption: `Return reference ${returnReference}`,
    purposes,
    returnLogId,
    returnPeriod: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReceivedDate: formatLongDate(new Date(receivedDate)),
    siteDescription,
    tariff: twoPartTariff ? 'Two-part' : 'Standard'
  }
}

module.exports = {
  go
}
