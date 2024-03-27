'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/check-your-answers` page
 * @module CheckYourAnswersPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

function go (session) {
  const data = {
    id: session.id,
    journey: session.data.journey,
    licenceRef: session.data.licence.licenceRef,
    reason: session.data.reason,
    startDate: _startDate(session.data)
  }

  return data
}

function _startDate (sessionData) {
  const selectedOption = sessionData.startDateOptions
  let date

  if (selectedOption === 'licenceStartDate') {
    date = new Date(sessionData.licence.currentVersionStartDate)
  }

  if (selectedOption === 'anotherStartDate') {
    const day = sessionData.startDateDay
    const month = sessionData.startDateMonth
    const year = sessionData.startDateYear

    date = new Date(`${year}-${month}-${day}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
