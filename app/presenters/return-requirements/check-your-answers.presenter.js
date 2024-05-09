'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/check-your-answers` page
 * @module CheckYourAnswersPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const FetchReturnRequirementsBasedOnAbstractionDataService =
  require('../../services/return-requirements/fetch-abstraction-data-return-requirements.service.js')

async function go (session) {
  console.log(session)
  if (session.setup === 'use-abstraction-data') {
    const result = await FetchReturnRequirementsBasedOnAbstractionDataService.go(session.licence.id)
  }

  const data = {
    id: session.id,
    journey: session.journey,
    licenceRef: session.licence.licenceRef,
    note: session.note ? session.note.content : '',
    reason: session.reason,
    startDate: _startDate(session),
    userEmail: session.note ? session.note.userEmail : 'No notes added'
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
