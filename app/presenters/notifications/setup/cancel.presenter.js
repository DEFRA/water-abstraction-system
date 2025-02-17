'use strict'

/**
 * Formats data for the `/notifications/setup/{sessionId}/cancel` page
 * @module CancelPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')
const DetermineReturnsPeriodService = require('../../../services/notifications/setup/determine-returns-period.service.js')

/**
 * Formats data for the `/notifications/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 * @param session
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode } = session

  return {
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

  const { returnsPeriod } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  const textPrefix = _textPrefix(returnsPeriod)

  return {
    text: 'Returns period',
    value: `${textPrefix} ${formatLongDate(returnsPeriod.startDate)} to ${formatLongDate(returnsPeriod.endDate)}`
  }
}

function _textPrefix(returnPeriod) {
  if (returnPeriod.name === 'allYear') {
    return 'Winter and all year annual'
  } else if (returnPeriod.name === 'summer') {
    return 'Summer annual'
  } else {
    return 'Quarterly'
  }
}

module.exports = {
  go
}
