'use strict'

/**
 * @module ReturnHelper
 */

const ReturnModel = require('../../../../app/models/returns/return.model.js')

/**
 * Add a new return
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `returnId` - v1:1:9/99/99/99/9999:10021668:2022-04-01:2023-03-31
 * - `regime` - water
 * - `licenceType` - abstraction
 * - `startDate` - 2022-04-01
 * - `endDate` - 2023-03-31
 * - `returnsFrequency` - month
 * - `status` - completed
 * - `source` - NALD
 * - `metadata` - {}
 * - `receivedDate` - 2023-04-12
 * - `returnRequirement` - 99999
 * - `dueDate` - 2023-04-28
 * - `returnCycleId` - 2eb314fe-da45-4ae9-b418-7d89a8c49c51
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ReturnModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new return
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    returnId: 'v1:1:9/99/99/99/9999:10021668:2022-04-01:2023-03-31',
    regime: 'water',
    licenceType: 'abstraction',
    licenceRef: '9/99/99/99/9999',
    startDate: '2022-04-01',
    endDate: '2023-03-31',
    returnsFrequency: 'month',
    status: 'completed',
    source: 'NALD',
    metadata: {},
    receivedDate: '2023-04-12',
    returnRequirement: '99999',
    dueDate: '2023-04-28',
    returnCycleId: '2eb314fe-da45-4ae9-b418-7d89a8c49c51'
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
