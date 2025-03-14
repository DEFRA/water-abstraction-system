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
  return {
    ...returnLog,
    ..._formatReceivedDate(returnLog.receivedDate),
    beenReceived: _formatBeenReceived(returnLog.receivedDate),
    journey: _formatJourney(returnLog.nilReturn),
    lines: returnLog.returnSubmissions[0].returnSubmissionLines,
    meterProvided: _formatMeterProvided(returnLog.meterMake, returnLog.meterSerialNumber),
    meter10TimesDisplay: _formatMeter10TimesDisplay(returnLog.multiplier),
    purposes: _formatPurposes(returnLog.purposes),
    reported: _formatReported(returnLog.method),
    units: _formatUnits(returnLog.units)
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
      ref('returnLogs.metadata:isTwoPartTariff').as('twoPartTariff'),
      'returnSubmissions.nilReturn',
      ref('returnSubmissions.metadata:units').as('units'),
      ref('returnSubmissions.metadata:method').as('method'),
      ref('returnSubmissions.metadata:meters[0].manufacturer').as('meterMake'),
      ref('returnSubmissions.metadata:meters[0].multiplier').as('multiplier'),
      ref('returnSubmissions.metadata:meters[0].serialNumber').as('meterSerialNumber'),
      ref('returnSubmissions.metadata:meters[0].startReading').as('startReading')
    )
    .innerJoinRelated('licence')
    .innerJoinRelated('returnSubmissions')
    .where('returnSubmissions.current', true)
    .withGraphFetched('returnSubmissions.returnSubmissionLines')
    .modifyGraph('returnSubmissions', (builder) => {
      builder.select(['metadata'])
    })
    .modifyGraph('returnSubmissions.returnSubmissionLines', (builder) => {
      builder.select(['id', 'startDate', 'endDate', 'quantity', 'userUnit']).orderBy('startDate', 'asc')
    })
    .where('returnLogs.id', returnLogId)
}

function _formatMeter10TimesDisplay(multiplier) {
  if (multiplier === 10) {
    return 'yes'
  }

  if (multiplier === 1) {
    return 'no'
  }

  return null
}

function _formatBeenReceived(receivedDate) {
  return receivedDate !== null
}

function _formatJourney(nilReturn) {
  return nilReturn ? 'nil-return' : 'enter-return'
}

function _formatMeterProvided(meterMake, meterSerialNumber) {
  return meterMake && meterSerialNumber ? 'yes' : 'no'
}

function _formatPurposes(purposes) {
  return purposes.map((purpose) => {
    return purpose.tertiary.description
  })
}

function _formatReceivedDate(receivedDate) {
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

function _formatReported(method) {
  return method === 'abstractionVolumes' || null ? 'abstraction-volumes' : 'meter-readings'
}

// Format units in the form `m³`, `l` etc. to the text expected by the edit return pages, defaulting to cubic metres
function _formatUnits(units) {
  return UNITS[units || unitNames.CUBIC_METRES]
}

module.exports = {
  go
}
