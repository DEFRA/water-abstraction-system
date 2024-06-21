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
    note: {
      actions: _noteActions(note),
      text: note ? note.content : 'No notes added'
    },
    pageTitle: `Check the requirements for returns for ${licence.licenceHolder}`,
    reason: returnRequirementReasons[reason],
    reasonLink: _reasonLink(sessionId, returnsRequired),
    sessionId,
    startDate: _startDate(session)
  }
}

function _noteActions (note) {
  if (note?.content) {
    return [
      { text: 'Change', href: 'note' },
      { text: 'Delete', href: 'delete-note' }
    ]
  } else {
    return [
      { text: 'Add a note', href: 'note' }
    ]
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
