/**
 * Orchestrates cancelling the data for `/notices/setup/{sessionId}/abstraction-alerts/` journey
 *
 * @module SubmitCancelAlertsService
 */

import DeleteSessionDal from 'water-abstraction-engine/dal/delete-session.dal.js'
import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

/**
 * Orchestrates cancelling the data for `/notices/setup/{sessionId}/abstraction-alerts/` journey
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function submitCancelAlertsService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  await DeleteSessionDal(sessionId)

  return {
    monitoringStationId: session.monitoringStationId
  }
}
