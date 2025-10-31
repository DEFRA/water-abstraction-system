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
    returnId,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff
  } = session

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    backLink: `/system/return-logs/setup/${sessionId}/check`,
    pageTitle: 'You are about to cancel this return submission',
    purposes,
    returnId,
    returnPeriod: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReceivedDate: formatLongDate(new Date(receivedDate)),
    returnReference,
    siteDescription,
    tariff: twoPartTariff ? 'Two-part' : 'Standard'
  }
}

module.exports = {
  go
}
