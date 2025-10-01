'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 * @module CancelAlertsPresenter
 */

const { sentenceCase } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/cancel` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`, text: 'Back' },
    pageTitle: 'You are about to cancel this alert',
    pageTitleCaption: session.monitoringStationName,
    summaryList: _summaryList(session)
  }
}

function _summaryList(session) {
  return {
    text: 'Alert type',
    value: `${sentenceCase(session.alertType)}`
  }
}

module.exports = {
  go
}
