'use strict'

/**
 * @module ChargeVersionWorkflowHelper
 */

const ChargeVersionWorkflowModel = require('../../../../app/models/water/charge-version-workflow.model.js')

/**
 * Add a new charge version workflow
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceId` - 1acfbded-9cd4-4933-8e98-04cd9e92d884
 * - `status` - to_setup - Other possible values are: changes_requested & review
 * - `data` - { chargeVersion: null },
 * - `createdAt` - 2022-02-23
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChangeReasonModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChargeVersionWorkflowModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new charge version workflow
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    licenceId: '1acfbded-9cd4-4933-8e98-04cd9e92d884',
    status: 'to_setup',
    data: { chargeVersion: null },
    // INFO: The charge_version_workflows table does not have a default for the date_created column. But it is set as
    // 'not nullable'! So, we need to ensure we set it when creating a new record, something we'll never actually need
    // to do because it's a static table. Also, we can't use Date.now() because Javascript returns the time since the
    // epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold the seconds since the epoch. Pass it
    // an ISO string though ('2022-02-23 09:19:39.953') and PostgreSQL can do the conversion
    // https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date('2022-02-23 09:19:39.953').toISOString()
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
