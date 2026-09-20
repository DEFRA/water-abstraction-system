/**
 * Fetches return cycles with 'due' returns that have no due date, so are awaiting a returns invitation
 * @module FetchReturnsInvitationPeriods
 */

import ReturnCycleModel from 'water-abstraction-engine/models/return-cycle.model.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Fetches return cycles with 'due' returns that have no due date, so are awaiting a returns invitation
 *
 * @returns {Promise<module:ReturnCycleModel[]>} the return cycles with 'due' returns awaiting a returns invitation
 */
export default async function fetchReturnsInvitationPeriods() {
  return ReturnCycleModel.query()
    .select(['endDate', 'id', 'startDate', 'summer'])
    .whereExists(
      ReturnCycleModel.relatedQuery('returnLogs')
        .where('status', 'due')
        .where('endDate', '<', today())
        .whereNull('dueDate')
    )
    .orderBy('endDate', 'desc')
}
