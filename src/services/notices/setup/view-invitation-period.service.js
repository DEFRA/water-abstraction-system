/**
 * Orchestrates fetching and presenting the data needed for the notices setup invitation periods page
 * @module ViewInvitationPeriodService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import FetchReturnsInvitationPeriods from '../../../dal/notices/setup/fetch-returns-invitation-periods.dal.js'
import InvitationPeriodsPresenter from '../../../presenters/notices/setup/invitation-period.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup invitation periods page
 *
 * @param {string} sessionId - The UUID for setup returns notification session record
 *
 * @returns {Promise<object>} The view data for the invitation periods page
 */
export default async function viewInvitationPeriodService(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const returnCycles = await FetchReturnsInvitationPeriods()

  const formattedData = InvitationPeriodsPresenter(session, returnCycles)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}
