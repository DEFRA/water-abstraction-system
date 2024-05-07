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
    note: session.data.note ? session.data.note.content : null,
    reason: session.data.reason,
    startDate: _startDate(session.data),
    userEmail: session.data.note ? session.data.note.userEmail : 'No notes added'
  }

  return data
}

function _startDate (session) {
  const selectedOption = session.startDateOptions
  let date

  if (selectedOption === 'licenceStartDate') {
    date = new Date(session.licence.currentVersionStartDate)
  } else {
    const day = session.startDateDay
    const month = session.startDateMonth
    const year = session.startDateYear

    date = new Date(`${year}-${month}-${day}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
