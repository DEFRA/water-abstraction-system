/**
 * Fetches the matching return cycle
 * @module FetchReturnCycle
 */

import ReturnCycleModel from 'water-abstraction-engine/models/return-cycle.model.js'

/**
 * Fetches the return cycle matching the given ID
 *
 * @param {string} returnCycleId - The UUID of the return cycle to fetch
 *
 * @returns {Promise<module:ReturnCycleModel>} the return cycle matching the given ID
 */
export default async function fetchReturnCycle(returnCycleId) {
  return ReturnCycleModel.query().select(['dueDate', 'endDate', 'id', 'startDate', 'summer']).findById(returnCycleId)
}
