/**
 * @module ChangeReasonHelper
 */

import ChargeReasonModel from '../../../app/models/change-reason.model.js'
import { data as changeReasons } from '../../../db/seeds/data/change-reasons.js'
import { selectRandomEntry } from '../general.js'

/**
 * Select an entry from the reference data entries seeded at the start of testing
 *
 * Because this helper is linked to a reference record instead of a transaction, we don't expect these to be created
 * when using the service.
 *
 * So, they are seeded automatically when tests are run. Tests that need to link to a record can use this method to
 * select a specific entry, or have it return one at random.
 *
 * @param {number} [index=-1] - The reference entry to select. Defaults to -1 which means an entry will be returned at
 * random from the reference data
 *
 * @returns {module:ChargeReasonModel} The selected reference entry or one picked at random
 */
function select(index = -1) {
  if (index > -1) {
    return ChargeReasonModel.fromJson(changeReasons[index])
  }

  return ChargeReasonModel.fromJson(selectRandomEntry(changeReasons))
}

export {
  changeReasons as data,
  select
}
export default {
  data: changeReasons,
  select
}
