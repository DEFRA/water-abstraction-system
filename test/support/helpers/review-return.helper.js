'use strict'

/**
 * @module ReviewReturnHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('./licence.helper.js')
const { generateReturnLogId } = require('./return-log.helper.js')
const { generateLegacyId } = require('./return-requirement.helper.js')
const ReviewReturnModel = require('../../../app/models/review-return.model.js')

/**
 * Add a new review return for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `reviewLicenceId` - [random UUID]
 * - `returnId` - v1:1:[the generated licenceRef]:[the generated returnReference]:2022-04-01:2023-03-31
 * - `returnReference` - [randomly generated - 10000321]
 * - `returnStatus` - completed
 * - `abstractionOutsidePeriod` - false
 * - `receivedDate` - 2022-06-03
 * - `dueDate` - 2022-06-03
 * - `purposes` - [{}]
 * - `description` - Lands at Mosshayne Farm, Exeter & Broadclyst
 * - `startDate` - 2022-04-01
 * - `endDate` - 2022-05-06
 * - `issues` - ''
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReviewReturnModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return ReviewReturnModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here in the database
 *
 * @returns {object} - Returns data from the query
 */
function defaults(data = {}) {
  const licenceRef = data.licenceRef ? data.licenceRef : generateLicenceRef()
  const returnReference = data.returnReference ? data.returnReference : generateLegacyId()

  const defaults = {
    reviewLicenceId: generateUUID(),
    returnId: generateReturnLogId('2022-04-01', '2023-03-31', 1, licenceRef, returnReference),
    returnReference,
    returnStatus: 'completed',
    abstractionOutsidePeriod: false,
    receivedDate: new Date('2022-06-03'),
    dueDate: new Date('2022-06-03'),
    purposes: {},
    description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
    startDate: new Date('2022-04-01'),
    endDate: new Date('2022-05-06'),
    issues: ''
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add,
  defaults
}
