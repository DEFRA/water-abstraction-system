'use strict'

/**
 * @module ReturnLogHelper
 */

const { generateLicenceRef } = require('./licence.helper.js')
const { randomInteger } = require('./general.helper.js')
const { timestampForPostgres } = require('../../../app/lib/general.lib.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

/**
 * Add a new return log
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - v1:1:[the generated licenceRef]:[the generated returnRequirement]:2022-04-01:2023-03-31
 * - `createdAt` - new Date()
 * - `dueDate` - 2023-04-28
 * - `endDate` - 2023-03-31
 * - `licenceRef` - [randomly generated - 1/23/45/76/3672]
 * - `metadata` - {}
 * - `receivedDate` - 2023-04-12
 * - `returnRequirement` - [randomly generated - 10000321]
 * - `returnsFrequency` - month
 * - `startDate` - 2022-04-01
 * - `status` - completed
 * - `updatedAt` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
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
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const licenceRef = data.licenceRef ? data.licenceRef : generateLicenceRef()
  const returnRequirement = data.returnRequirement ? data.returnRequirement : randomInteger(10000000, 19999999)
  const timestamp = timestampForPostgres()

  const defaults = {
    id: generateReturnLogId('2022-04-01', '2023-03-31', 1, licenceRef, returnRequirement),
    createdAt: timestamp,
    dueDate: new Date('2023-04-28'),
    endDate: new Date('2023-03-31'),
    licenceRef,
    metadata: {},
    receivedDate: new Date('2023-04-12'),
    returnRequirement,
    returnsFrequency: 'month',
    startDate: new Date('2022-04-01'),
    status: 'completed',
    updatedAt: timestamp
  }

  return {
    ...defaults,
    ...data
  }
}

function generateReturnLogId (
  startDate = '2022-04-01',
  endDate = '2023-03-31',
  version = 1,
  licenceRef,
  returnRequirement
) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  if (!returnRequirement) {
    returnRequirement = randomInteger(10000000, 19999999)
  }

  return `v${version}:1:${licenceRef}:${returnRequirement}:${startDate}:${endDate}`
}

module.exports = {
  add,
  defaults,
  generateReturnLogId
}
