'use strict'

/**
 * @module ReviewReturnResultHelper
 */

const { randomInteger } = require('./general.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('./water/licence.helper.js')
const ReviewReturnResultModel = require('../../../app/models/review-return-result.model.js')

/**
 * Add a new return result for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `returnId` - v1:1:[the generated licenceRef]:[the generated returnRequirement]:2022-04-01:2023-03-31
 * - `returnReference` - `10031343`
 * - startDate - 2022-04-01
 * - endDate - 2022-05-06
 * - dueDate - 2022-06-03
 * - receivedDate - 2022-06-03
 * - status - `completed`
 * - underQuery - false
 * - nilReturn - false
 * - description - `Lands at Mosshayne Farm, Exeter & Broadclyst`
 * - purposes - {}
 * - quantity - 0
 * - allocated - 0
 * - abstractionOutsidePeriod - false
 * - updatedAt - null
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ReviewReturnResultModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReviewReturnResultModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here in the database
 */
function defaults (data = {}) {
  const licenceRef = data.licenceRef ?? generateReturnLogId
  const returnRequirement = data.returnRequirement ?? randomInteger(10000000, 19999999)

  const defaults = {
    id: generateUUID(),
    returnId: generateReturnLogId('2022-04-01', '2023-03-31', 1, licenceRef, returnRequirement),
    returnReference: '10031343',
    startDate: new Date('2022-04-01'),
    endDate: new Date('2022-05-06'),
    dueDate: new Date('2022-06-03'),
    receivedDate: new Date('2022-06-03'),
    status: 'completed',
    underQuery: false,
    nilReturn: false,
    description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
    purposes: {},
    quantity: 0,
    allocated: 0,
    abstractionOutsidePeriod: false,
    updatedAt: null
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
  defaults
}
