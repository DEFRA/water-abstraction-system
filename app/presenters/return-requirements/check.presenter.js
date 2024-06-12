'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

function go (session) {
  const { additionalSubmissionOptions, id: sessionId, journey, licence, note, reason } = session

  const returnsRequired = journey === 'returns-required'

  return {
    additionalSubmissionOptions: additionalSubmissionOptions ?? [],
    licenceRef: licence.licenceRef,
    note: note ? note.content : null,
    pageTitle: `Check the requirements for returns for ${licence.licenceHolder}`,
    reason: returnRequirementReasons[reason],
    reasonLink: _reasonLink(sessionId, returnsRequired),
    sessionId,
    startDate: _startDate(session),
    userEmail: note ? note.userEmail : 'No notes added'
  }
}

function _reasonLink (sessionId, returnsRequired) {
  if (returnsRequired) {
    return `/system/return-requirements/${sessionId}/reason`
  }

  return `/system/return-requirements/${sessionId}/no-returns-required`
}

function _startDate (session) {
  const { licence, startDateOptions, startDateDay, startDateMonth, startDateYear } = session

  let date

  if (startDateOptions === 'licenceStartDate') {
    date = new Date(licence.currentVersionStartDate)
  } else {
    date = new Date(`${startDateYear}-${startDateMonth}-${startDateDay}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
