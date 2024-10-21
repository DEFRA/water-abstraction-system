'use strict'

/**
 * Formats data for the `/return-requirements/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatLongDate } = require('../../../base.presenter.js')
const { returnRequirementReasons } = require('../../../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/return-requirements/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go (session) {
  const { additionalSubmissionOptions, id: sessionId, journey, licence, note, reason } = session

  const returnsRequired = journey === 'returns-required'

  return {
    additionalSubmissionOptions: additionalSubmissionOptions ?? [],
    licenceRef: licence.licenceRef,
    note: _note(note),
    pageTitle: `Check the requirements for returns for ${licence.licenceHolder}`,
    reason: returnRequirementReasons[reason],
    reasonLink: _reasonLink(sessionId, returnsRequired),
    sessionId,
    startDate: _startDate(session)
  }
}

function _note (note) {
  if (note?.content) {
    return {
      actions: [
        { text: 'Change', href: 'note' },
        { text: 'Delete', href: 'delete-note' }
      ],
      text: note.content
    }
  } else {
    return {
      actions: [
        { text: 'Add a note', href: 'note' }
      ],
      text: 'No notes added'
    }
  }
}

function _reasonLink (sessionId, returnsRequired) {
  if (returnsRequired) {
    return `/system/return-requirements/setup/${sessionId}/reason`
  }

  return `/system/return-requirements/setup/${sessionId}/no-returns-required`
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
