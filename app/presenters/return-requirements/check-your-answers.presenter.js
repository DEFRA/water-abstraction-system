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
    reason: _reason(session.data),
    startDate: _startDate(session.data)
  }

  return data
}

function _reason (data) {
  let reason = data.returnsRequired
  if (data.journey === 'no-returns-required') {
    reason = data.noReturnsRequired
  }

  return reason
}

function _startDate (data) {
  const selectedOption = data.startDateOptions
  let date

  if (selectedOption === 'licenceStartDate') {
    date = new Date(data.licence.currentVersionStartDate)
  }

  if (selectedOption === 'anotherStartDate') {
    const day = data.startDateDay
    const month = data.startDateMonth
    const year = data.startDateYear

    date = new Date(`${year}-${month}-${day}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
