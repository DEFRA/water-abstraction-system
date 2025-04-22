'use strict'

/**
 * Formats data for the `/notifications/setup/{sessionId}/cancel` page
 * @module CancelPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the `/notifications/setup/{sessionId}/cancel` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode } = session

  return {
    backLink: `/system/notifications/setup/${session.id}/check`,
    pageTitle: 'You are about to cancel this notification',
    referenceCode,
    summaryList: _summaryList(session)
  }
}

function _summaryList(session) {
  if (session.journey === 'ad-hoc') {
    return {
      text: 'Licence number',
      value: session.licenceRef
    }
  }

  const {
    determinedReturnsPeriod: { name, startDate, endDate }
  } = session

  const textPrefix = _textPrefix(name)

  return {
    text: 'Returns period',
    value: `${textPrefix} ${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`
  }
}

function _textPrefix(name) {
  if (name === 'allYear') {
    return 'Winter and all year annual'
  } else if (name === 'summer') {
    return 'Summer annual'
  } else {
    return 'Quarterly'
  }
}

module.exports = {
  go
}
