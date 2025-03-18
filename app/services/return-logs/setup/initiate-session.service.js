'use strict'

/**
 * Initiates the session record used for setting up a new return log edit journey
 * @module InitiateSessionService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')
const { unitNames } = require('../../../lib/static-lookups.lib.js')

const UNITS = {
  [unitNames.CUBIC_METRES]: 'cubic-metres',
  [unitNames.LITRES]: 'litres',
  [unitNames.MEGALITRES]: 'megalitres',
  [unitNames.GALLONS]: 'gallons'
}

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
  returnLog.returnSubmissions[0].$applyReadings()

  // We use destructuring to discard things we've fetched that are needed to format data but not needed in the session
  const { method, multiplier, nilReturn, returnSubmissions, ...data } = _data(returnLog)

  return SessionModel.query().insert({ data }).returning('id')
}

function _data(returnLog) {
  Object.assign(returnLog, _returnSubmissionsData(returnLog.returnSubmissions[0]))

  return {
    ...returnLog,
    ..._receivedDate(returnLog.receivedDate),
    beenReceived: returnLog.receivedDate !== null,
    journey: returnLog.nilReturn ? 'nil-return' : 'enter-return',
    lines: returnLog.returnSubmissions[0]?.returnSubmissionLines,
    meter10TimesDisplay: returnLog.multiplier === 10 ? 'yes' : returnLog.multiplier === 1 ? 'no' : null,
    meterProvided: returnLog.meterMake && returnLog.meterSerialNumber ? 'yes' : 'no',
    purposes: _purposes(returnLog.purposes),
    reported: returnLog.method === 'abstractionVolumes' || null ? 'abstraction-volumes' : 'meter-readings',
    units: UNITS[returnLog.units || unitNames.CUBIC_METRES]
  }
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
    .withGraphFetched('returnSubmissions.returnSubmissionLines')
    .modifyGraph('returnSubmissions', (builder) => {
      builder.select(['metadata', 'nilReturn']).where('returnSubmissions.current', true)
    })
    .modifyGraph('returnSubmissions.returnSubmissionLines', (builder) => {
      builder.select(['id', 'startDate', 'endDate', 'quantity', 'userUnit']).orderBy('startDate', 'asc')
    })
    .where('returnLogs.id', returnLogId)
}

function _purposes(purposes) {
  return purposes.map((purpose) => {
    return purpose.tertiary.description
  })
}

function _receivedDate(receivedDate) {
  if (!receivedDate) {
    return {}
  }

  return {
    receivedDateOptions: 'custom-date',
    receivedDateDay: `${receivedDate.getDate()}`,
    receivedDateMonth: `${receivedDate.getMonth() + 1}`,
    receivedDateYear: `${receivedDate.getFullYear()}`
  }
}

function _returnSubmissionsData(returnSubmission) {
  const { metadata, nilReturn } = returnSubmission

  const meter = metadata?.meters?.[0]

  return {
    nilReturn,
    meterMake: meter?.manufacturer || null,
    meterSerialNumber: meter?.serialNumber || null,
    method: metadata.method,
    multiplier: meter?.multiplier || null,
    startReading: meter?.startReading || null,
    units: metadata.units
  }
}

module.exports = {
  go
}
