'use strict'

/**
 * Initiates the session record used for setting up a new return log edit journey
 * @module InitiateSessionService
 */

const { daysFromPeriod, weeksFromPeriod, monthsFromPeriod } = require('../../../lib/dates.lib.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')
const { returnUnits, unitNames } = require('../../../lib/static-lookups.lib.js')

const FeatureFlags = require('../../../../config/feature-flags.config.js')

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
 * @returns {Promise<string>} the url to redirect to
 */
async function go(returnLogId) {
  if (!FeatureFlags.enableSystemReturnsSubmit) {
    return `/return/internal?returnId=${returnLogId}`
  }

  const returnLog = await _fetchReturnLog(returnLogId)

  const referenceData = _referenceData(returnLog)
  const submissionData = _submissionData(referenceData.lines, returnLog)

  const data = { ...referenceData, ...submissionData }

  const { id: sessionId } = await SessionModel.query().insert({ data }).returning('id')

  const redirect = data.submissionType === 'edit' ? 'check' : 'received'

  return `/system/return-logs/setup/${sessionId}/${redirect}`
}

async function _fetchReturnLog(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'id',
      'startDate',
      'endDate',
      'receivedDate',
      'returnReference',
      'dueDate',
      'status',
      'underQuery',
      'returnsFrequency',
      'metadata'
    )
    .where('id', returnLogId)
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .select(['metadata', 'nilReturn'])
        .where('current', true)
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder
            .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
            .orderBy('startDate', 'asc')
        })
    })
}

function _lines(returnsFrequency, startDate, endDate) {
  let lines

  if (returnsFrequency === 'day') {
    lines = daysFromPeriod(startDate, endDate)
  }

  if (returnsFrequency === 'week') {
    lines = weeksFromPeriod(startDate, endDate)
  }

  if (returnsFrequency === 'month') {
    lines = monthsFromPeriod(startDate, endDate)
  }

  return lines
}

function _meter(meter) {
  const multiplier = meter?.multiplier ? parseInt(meter?.multiplier) : null

  let meter10TimesDisplay = null
  if (multiplier === 10) {
    meter10TimesDisplay = 'yes'
  }

  if (multiplier === 1) {
    meter10TimesDisplay = 'no'
  }

  const meterMake = meter?.manufacturer || null
  const meterSerialNumber = meter?.serialNumber || null

  return {
    meter10TimesDisplay,
    meterMake,
    meterProvided: meterMake && meterSerialNumber ? 'yes' : 'no',
    meterSerialNumber,
    startReading: meter?.startReading
  }
}

function _purposes(purposes) {
  return purposes.map((purpose) => {
    return purpose.tertiary.description
  })
}

function _referenceData(returnLog) {
  const {
    dueDate,
    endDate,
    id: returnLogId,
    licence,
    metadata,
    receivedDate,
    returnsFrequency,
    returnReference,
    returnSubmissions,
    startDate,
    status,
    underQuery
  } = returnLog

  return {
    beenReceived: receivedDate !== null,
    dueDate,
    endDate,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    lines: _lines(returnsFrequency, startDate, endDate),
    periodEndDay: parseInt(metadata.nald.periodEndDay),
    periodEndMonth: parseInt(metadata.nald.periodEndMonth),
    periodStartDay: parseInt(metadata.nald.periodStartDay),
    periodStartMonth: parseInt(metadata.nald.periodStartMonth),
    purposes: _purposes(metadata.purposes),
    receivedDate,
    returnsFrequency,
    returnReference,
    returnLogId,
    siteDescription: metadata.description,
    startDate,
    status,
    submissionType: returnSubmissions.length > 0 ? 'edit' : 'submit',
    twoPartTariff: metadata.isTwoPartTariff,
    underQuery
  }
}

function _submissionData(lines, returnLog) {
  if (returnLog.returnSubmissions.length === 0) {
    return {}
  }

  const returnSubmission = returnLog.returnSubmissions[0]

  returnSubmission.$applyReadings()

  const { metadata, nilReturn, returnSubmissionLines } = returnSubmission
  const meter = _meter(metadata?.meters?.[0])
  const method = metadata?.method || null

  return {
    journey: nilReturn ? 'nil-return' : 'enter-return',
    lines: nilReturn ? lines : _submissionLines(returnSubmissionLines),
    meter10TimesDisplay: meter.meter10TimesDisplay,
    meterMake: meter.meterMake,
    meterProvided: meter.meterProvided,
    meterSerialNumber: meter.meterSerialNumber,
    receivedDateOptions: returnLog.receivedDate && 'custom-date',
    receivedDateDay: returnLog.receivedDate && `${returnLog.receivedDate.getDate()}`,
    receivedDateMonth: returnLog.receivedDate && `${returnLog.receivedDate.getMonth() + 1}`,
    receivedDateYear: returnLog.receivedDate && `${returnLog.receivedDate.getFullYear()}`,
    reported: method === 'oneMeter' ? 'meter-readings' : 'abstraction-volumes',
    startReading: meter.startReading,
    units: UNITS[metadata.units || unitNames.CUBIC_METRES]
  }
}

function _submissionLines(returnSubmissionLines) {
  return returnSubmissionLines.map((returnSubmissionLine) => {
    const { endDate, quantity, reading, startDate, userUnit } = returnSubmissionLine

    let convertedQuantity
    if (quantity) {
      convertedQuantity = quantity * returnUnits[userUnit].multiplier
    }

    return {
      endDate,
      quantity: convertedQuantity,
      reading: reading ?? null,
      startDate
    }
  })
}

module.exports = {
  go
}
