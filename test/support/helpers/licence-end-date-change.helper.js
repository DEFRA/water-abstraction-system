/**
 * @module LicenceEndDateChangeHelper
 */

import { formatDateObjectToISO } from '../../../app/lib/dates.lib.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import LicenceEndDateChangeModel from '../../../app/models/licence-end-date-change.model.js'

/**
 * Add a new licence end date change
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceId` - [random UUID]
 * - `dateType` - revoked
 * - `changeDate` - current Date as 'YYYY-MM-DD' string
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceEndDateChangeModel.query()
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
function defaults(data = {}) {
  const changeDate = formatDateObjectToISO(new Date())

  const defaults = {
    licenceId: generateUUID(),
    dateType: 'revoked',
    changeDate
  }

  return {
    ...defaults,
    ...data
  }
}

export {
  add,
  defaults
}
export default {
  add,
  defaults
}
