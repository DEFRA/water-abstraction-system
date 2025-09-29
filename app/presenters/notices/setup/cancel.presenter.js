'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/cancel` page
 * @module CancelPresenter
 */

const { formatLongDate, sentenceCase } = require('../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/cancel` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode } = session

  return {
    backLink: { href: `/system/notices/setup/${session.id}/check`, text: 'Back' },
    pageTitle: 'You are about to cancel this notice',
    pageTitleCaption: `Notice ${referenceCode}`,
    summaryList: _summaryList(session)
  }
}

function _summaryList(session) {
  if (session.journey === 'alerts') {
    return {
      text: 'Alert type',
      value: `${sentenceCase(session.alertType)}`
    }
  }

  if (session.licenceRef) {
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
