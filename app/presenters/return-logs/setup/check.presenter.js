'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatAbstractionPeriod, formatLongDate, sentenceCase } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/check` page
 */
function go(session) {
  const {
    endDate,
    id: sessionId,
    meterMake,
    meterProvided,
    meterSerialNumber,
    note,
    periodEndDay,
    periodEndMonth,
    periodStartDay,
    periodStartMonth,
    purposes,
    receivedDate,
    reported,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff,
    units
  } = session

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    links: {
      cancel: `/system/return-logs/setup/${sessionId}/cancel`,
      meterDetails: `/system/return-logs/setup/${sessionId}/meter-details`,
      received: `/system/return-logs/setup/${sessionId}/received`,
      reported: `/system/return-logs/setup/${sessionId}/reported`
    },
    meterMake,
    meterProvided,
    meterSerialNumber,
    note: _note(note),
    pageTitle: 'Check details and enter new volumes or readings',
    purposes,
    reportingFigures: reported === 'meter-readings' ? 'Meter readings' : 'Volumes',
    returnPeriod: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReceivedDate: formatLongDate(new Date(receivedDate)),
    returnReference,
    siteDescription,
    tariff: twoPartTariff ? 'Two-part' : 'Standard',
    units: units === 'cubic-metres' ? 'Cubic metres' : sentenceCase(units)
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

module.exports = {
  go
}
