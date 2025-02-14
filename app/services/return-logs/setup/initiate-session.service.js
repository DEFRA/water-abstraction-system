'use strict'

/**
 * Initiates the session record used for setting up a new return log edit journey
 * @module InitiateSessionService
 */

const { ref } = require('objection')

const { daysFromPeriod, weeksFromPeriod, monthsFromPeriod } = require('../../../lib/dates.lib.js')

const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up a new return log edit journey
 *
 * During the setup for a new return log edit we temporarily store the data in a `SessionModel`
 * instance. It is expected that on each page of the journey the GET will fetch the session record and use it to
 * populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to create the edited return log
 * and the session record itself deleted.
 *
 * @param {string} returnLogId - The UUID of the return log to be fetched
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(returnLogId) {
  const returnLog = await _fetchReturnLog(returnLogId)

  const data = _data(returnLog)

  return SessionModel.query().insert({ data }).returning('id')
}

function _data(returnLog) {
  const formattedPurposes = _formatPurposes(returnLog.purposes)
  const lines = _formatLines(returnLog.returnsFrequency, returnLog.startDate, returnLog.endDate)

  returnLog.beenReceived = returnLog.receivedDate !== null
  returnLog.purposes = formattedPurposes
  returnLog.lines = lines

  return returnLog
}

function _formatLines(frequency, startDate, endDate) {
  let lines

  if (frequency === 'day') {
    lines = daysFromPeriod(startDate, endDate)
  }

  if (frequency === 'week') {
    lines = weeksFromPeriod(startDate, endDate)
  }

  if (frequency === 'month') {
    lines = monthsFromPeriod(startDate, endDate)
  }

  return lines
}

async function _fetchReturnLog(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'licence.id as licenceId',
      'licence.licenceRef',
      'returnLogs.id as returnLogId',
      'returnLogs.startDate',
      'returnLogs.endDate',
      'returnLogs.receivedDate',
      'returnLogs.returnReference',
      'returnLogs.dueDate',
      'returnLogs.status',
      'returnLogs.underQuery',
      'returnLogs.returnsFrequency',
      ref('returnLogs.metadata:nald.periodStartDay').castInt().as('periodStartDay'),
      ref('returnLogs.metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
      ref('returnLogs.metadata:nald.periodEndDay').castInt().as('periodEndDay'),
      ref('returnLogs.metadata:nald.periodEndMonth').castInt().as('periodEndMonth'),
      ref('returnLogs.metadata:description').as('siteDescription'),
      ref('returnLogs.metadata:purposes').as('purposes'),
      ref('returnLogs.metadata:isTwoPartTariff').as('twoPartTariff')
    )
    .innerJoinRelated('licence')
    .where('returnLogs.id', returnLogId)
}

function _formatPurposes(purposes) {
  const purposeDescriptionArray = purposes.map((purpose) => {
    return purpose.tertiary.description
  })

  return purposeDescriptionArray.join(', ')
}

module.exports = {
  go
}
