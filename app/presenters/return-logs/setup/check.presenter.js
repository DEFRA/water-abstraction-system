'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/check` page
 */
function go(session) {
  const {
    id: sessionId,
    meterMake,
    meterProvided,
    meterSerialNumber,
    note,
    receivedDate,
    reported,
    returnReference,
    units
  } = session

  return {
    meterMake,
    meterProvided,
    meterSerialNumber,
    note: _note(note),
    pageTitle: 'Check details and enter new volumes or readings',
    returnReceivedDate: formatLongDate(new Date(receivedDate)),
    reportingFigures: reported === 'meter-readings' ? 'Meter readings' : 'Volumes',
    returnReference,
    sessionId,
    units: _units(units)
  }
}

function _note(note) {
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
      actions: [{ text: 'Add a note', href: 'note' }],
      text: 'No notes added'
    }
  }
}

function _units(units) {
  // Need to do something to format the units
  return units
}

module.exports = {
  go
}
