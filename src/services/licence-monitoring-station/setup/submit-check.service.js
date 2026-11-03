/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @module SubmitCheckService
 */

import DeleteSessionDal from 'water-abstraction-engine/dal/delete-session.dal.js'
import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { flashNotification } from 'water-abstraction-engine/lib/general.lib.js'

import CreateTagDal from '../../../dal/licence-monitoring-station/setup/create-tag.dal.js'

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} userId - The ID of the current user
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<string>} The monitoring station id used to redirect back to the monitoring station page
 */
export default async function submitCheckService(sessionId, userId, yar) {
  const session = await FetchSessionDal(sessionId)

  await CreateTagDal(session, userId)

  await DeleteSessionDal(sessionId)

  flashNotification(yar, 'Success', `Tag for licence ${session.licenceRef} added`)

  return session.monitoringStationId
}
