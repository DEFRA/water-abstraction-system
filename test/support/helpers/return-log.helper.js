'use strict'

/**
 * @module ReturnLogHelper
 */

const { generateLicenceRef } = require('./licence.helper.js')
const { randomInteger } = require('../general.js')
const { timestampForPostgres } = require('../../../app/lib/general.lib.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

/**
 * Add a new return log
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - v1:1:[the generated licenceRef]:[the generated returnReference]:2022-04-01:2023-03-31
 * - `createdAt` - new Date()
 * - `dueDate` - 2023-04-28
 * - `endDate` - 2023-03-31
 * - `licenceRef` - [randomly generated - 1/23/45/76/3672]
 * - `metadata` - {}
 * - `receivedDate` - 2023-04-12
 * - `returnReference` - [randomly generated - 10000321]
 * - `returnsFrequency` - month
 * - `startDate` - 2022-04-01
 * - `status` - completed
 * - `updatedAt` - new Date()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnLogModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnLogModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const licenceRef = data.licenceRef ? data.licenceRef : generateLicenceRef()
  const returnReference = data.returnReference ? data.returnReference : randomInteger(10000000, 19999999)
  const timestamp = timestampForPostgres()
  const receivedDate = data.receivedDate ? data.receivedDate : null
  const startDate = data.startDate ? data.startDate : '2022-04-01'
  const endDate = data.endDate ? data.endDate : '2023-03-31'

  const defaults = {
    id: generateReturnLogId(startDate, endDate, 1, licenceRef, returnReference),
    createdAt: timestamp,
    dueDate: new Date('2023-04-28'),
    endDate: new Date('2023-03-31'),
    licenceRef,
    metadata: {
      description: 'BOREHOLE AT AVALON',
      isCurrent: true,
      isFinal: false,
      isSummer: false,
      isTwoPartTariff: false,
      isUpload: false,
      nald: {
        regionCode: 9,
        areaCode: 'ARCA',
        formatId: returnReference,
        periodStartDay: 1,
        periodStartMonth: 4,
        periodEndDay: 28,
        periodEndMonth: 4
      },
      points: [],
      purposes: [],
      version: 1
    },
    receivedDate,
    returnReference,
    returnsFrequency: 'month',
    startDate: new Date('2022-04-01'),
    status: 'due',
    updatedAt: timestamp
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Returns a randomly generated return log Id
 *
 * Unlike other tables, the previous team opted to generate a unique ID based on properties of the return log including
 * start and end dates, version and references.
 *
 * So, in order to replicate that we have this helper method, that defaults some of those values, and randomises others
 * in order to generate a unique return log ID.
 *
 * If you have known values, for example, the licence reference they can be passed to this helper and it will
 * incorporate them into the ID.
 *
 * @param {string} [startDate] - the start date as a string, for example '2022-04-01'
 * @param {string} [endDate] - the end date as a string, for example '2023-03-31'
 * @param {number} [version] - the version number to use, for example 1
 * @param {string} [licenceRef] - the licence reference to use
 * @param {string} [returnReference] - the return requirement reference to use
 *
 * @returns {string} the generated return log ID
 */
function generateReturnLogId (
  startDate = '2022-04-01',
  endDate = '2023-03-31',
  version = 1,
  licenceRef = null,
  returnReference = null
) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  if (!returnReference) {
    returnReference = randomInteger(10000000, 19999999)
  }

  return `v${version}:1:${licenceRef}:${returnReference}:${startDate}:${endDate}`
}

async function hasContinousReturnLogs (licenceReference) {
  const returnLogs = await ReturnLogModel.query()
    .select(['endDate', 'startDate'])
    .where('licenceRef', licenceReference)
    .whereNot('status', 'void')
    .orderBy('startDate', 'ASC')

  if (returnLogs.length === 1) {
    return true
  }

  let isSequential = true

  for (let i = 0; i < returnLogs.length - 1; i++) {
    isSequential = _areDatesSequential(returnLogs[i].endDate, returnLogs[i + 1].startDate)
  }

  return isSequential
}

function _areDatesSequential (endDate, startDate) {
  const _endDate = new Date(endDate)
  const _startDate = new Date(startDate)

  const differenceInMs = Math.abs(_endDate - _startDate)
  const differenceInDays = differenceInMs / (24 * 60 * 60 * 1000)

  return differenceInDays <= 1
}

module.exports = {
  add,
  defaults,
  generateReturnLogId,
  hasContinousReturnLogs
}
