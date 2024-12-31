'use strict'

/**
 * Initiates the session record used for setting up a new return log edit journey
 * @module InitiateSessionService
 */

const ReturnLogModel = require('../../models/return-log.model.js')
const SessionModel = require('../../models/session.model.js')

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
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(returnLogId) {
  const returnLog = await _fetchReturnLog(returnLogId)

  const data = _data(returnLog)

  return SessionModel.query().insert({ data }).returning('id')
}

function _data(returnLog) {
  const formattedPurposes = _formatPurposes(returnLog.purposes)
  returnLog.purposes = formattedPurposes

  return returnLog
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
      'returnLogs.returnReference',
      'returnLogs.underQuery',
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
