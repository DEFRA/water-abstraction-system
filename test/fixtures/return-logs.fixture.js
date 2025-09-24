'use strict'

const {
  formatDateObjectToISO,
  daysFromPeriod,
  weeksFromPeriod,
  monthsFromPeriod
} = require('../../app/lib/dates.lib.js')
const { generateRandomInteger, generateUUID } = require('../../app/lib/general.lib.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')
const ReturnSubmissionLineModel = require('../../app/models/return-submission-line.model.js')

/**
 * Applies the fields that are returned by the FetchReturnLogService to a return log instance
 *
 * This is needed because the service does some pre-work for the presenter, by extracting values from `metadata` and
 * applying them to the result as top-level fields.
 *
 * @param {module:ReturnLogModel} returnLog - The return log instance to apply the fields to
 */
function applyFetchReturnLogFields(returnLog) {
  returnLog.siteDescription = returnLog.metadata.description
  returnLog.periodStartDay = returnLog.metadata.nald.periodStartDay
  returnLog.periodStartMonth = returnLog.metadata.nald.periodStartMonth
  returnLog.periodEndDay = returnLog.metadata.nald.periodEndDay
  returnLog.periodEndMonth = returnLog.metadata.nald.periodEndMonth
  returnLog.purposes = returnLog.metadata.purposes
  returnLog.twoPartTariff = returnLog.metadata.isTwoPartTariff
}

/**
 * Generates a return log instance with specified frequency and default date range.
 *
 * @param {string} returnsFrequency - The frequency of the returns (e.g., 'month', 'week', 'day'). Defaults to 'month'
 * @param {boolean} addLicence - Whether to add an instance of `LicenceModel` to the return log
 * @returns {module:ReturnLogModel} The generated return log instance with attributes such as start date, end date,
 * licence reference, return reference, and status
 */
function returnLog(returnsFrequency = 'month', addLicence = false) {
  const returnLogData = _returnLogData(returnsFrequency)
  const returnLog = ReturnLogModel.fromJson(returnLogData)

  if (addLicence) {
    returnLog.licence = LicenceModel.fromJson({
      id: generateUUID(),
      licenceRef: returnLog.licenceRef
    })
  }

  return returnLog
}

/**
 * Generates a return submission for a given return log, with the given type and units
 *
 * @param {module:ReturnLogModel} returnLog - The return log that the return submission is for
 * @param {string} type - The type of the return submission, defaults to 'estimated'
 * @param {string} userUnit - The unit of measurement for the return submission, defaults to 'm³'
 *
 * @returns {module:ReturnSubmissionModel} The generated return submission
 */
function returnSubmission(returnLog, type = 'estimated', userUnit = 'm³') {
  returnLog.status = 'completed'
  returnLog.receivedDate = new Date('2023-04-12')

  let version = 1

  if (returnLog.returnSubmissions) {
    for (const submission of returnLog.returnSubmissions) {
      submission.current = false
      version++
    }
  }

  const returnSubmission = ReturnSubmissionModel.fromJson({
    id: generateUUID(),
    createdAt: new Date('2023-12-16 09:42:11.000'),
    current: true,
    metadata: _returnSubmissionMetadata(returnLog, type),
    nilReturn: false,
    notes: null,
    returnLogId: returnLog.id,
    userId: 'admin-internal@wrls.gov.uk',
    userType: 'internal',
    version
  })

  returnSubmission.returnSubmissionLines = _returnSubmissionLines(returnLog, returnSubmission.id, type, userUnit)
  returnSubmission.$applyReadings()

  return returnSubmission
}

function _datedLines(returnLog) {
  const { endDate, returnsFrequency, startDate } = returnLog

  if (returnsFrequency === 'day') {
    return daysFromPeriod(startDate, endDate)
  }

  if (returnsFrequency === 'week') {
    return weeksFromPeriod(startDate, endDate)
  }

  return monthsFromPeriod(startDate, endDate)
}

function _returnLogData(returnsFrequency) {
  const defaults = ReturnLogHelper.defaults(returnsFrequency)

  defaults.underQuery = false

  defaults.metadata.purposes.push({
    alias: 'Mineral Washing alias',
    primary: {
      code: 'I',
      description: 'Industrial, Commercial And Public Services'
    },
    tertiary: {
      code: '300',
      description: 'Mineral Washing'
    },
    secondary: {
      code: 'MIN',
      description: 'Mineral Products'
    }
  })

  return defaults
}

function _returnSubmissionMetadata(returnLog, type) {
  if (type === 'estimated') {
    return {
      type: 'estimated',
      units: 'm³',
      meters: [],
      method: 'abstractionVolumes',
      totalFlag: false
    }
  }

  const startReading = generateRandomInteger(50, 150)
  const metadata = {
    type: 'measured',
    units: 'm³',
    meters: [
      {
        units: 'm³',
        multiplier: 10,
        manufacturer: 'MeterMaid',
        serialNumber: '123456X',
        startReading,
        meterDetailsProvided: true
      }
    ],
    method: 'oneMeter',
    totalFlag: false
  }

  const lines = _datedLines(returnLog)

  let reading = startReading

  metadata.meters[0].readings = lines.reduce((acc, line) => {
    const { startDate, endDate } = line

    reading++

    const key = `${formatDateObjectToISO(new Date(startDate))}_${formatDateObjectToISO(new Date(endDate))}`
    acc[key] = reading

    return acc
  }, {})

  return metadata
}

function _returnSubmissionLines(returnLog, returnSubmissionId, type, userUnit) {
  const lines = _datedLines(returnLog)

  return lines.map((line) => {
    const { endDate, startDate } = line
    return ReturnSubmissionLineModel.fromJson({
      endDate,
      id: generateUUID(),
      quantity: generateRandomInteger(10, 5000),
      readingType: type === 'estimated' ? 'estimated' : 'measured',
      returnSubmissionId,
      startDate,
      userUnit
    })
  })
}

/**
 * This fixture would be the result of calling the 'FetchReturnsDueByLicenceRefService'
 *
 * We use these 'due' return logs in the adhoc notification journey for the 'returnForms' notice type.
 *
 * @returns {object} Returns an enhanced version of the module:ReturnLogModel in line with the fetch service
 */
function dueReturn() {
  const dueReturn = returnLog()

  applyFetchReturnLogFields(dueReturn)

  dueReturn.purpose = dueReturn.purposes[0].tertiary.description
  dueReturn.naldAreaCode = 'MIDLT'
  dueReturn.regionName = 'North West'
  dueReturn.regionCode = '1'
  dueReturn.returnLogId = dueReturn.id

  delete dueReturn.purposes
  delete dueReturn.id

  return dueReturn
}

module.exports = {
  applyFetchReturnLogFields,
  dueReturn,
  returnLog,
  returnSubmission
}
