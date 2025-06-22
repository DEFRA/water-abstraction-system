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
  const { referenceCode, journey } = session

  let pageData

  if (journey === 'abstraction-alert') {
    pageData = _alerts(session)
  } else {
    pageData = _returns(session)
  }

  return {
    backLink: `/system/notices/setup/${session.id}/check`,
    referenceCode,
    ...pageData
  }
}

function _alerts(session) {
  return {
    pageTitle: 'You are about to cancel this alert',
    summaryList: {
      text: 'Alert type',
      value: `${sentenceCase(session.alertType)}`
    }
  }
}

function _returns(session) {
  return {
    pageTitle: 'You are about to cancel this notice',
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
