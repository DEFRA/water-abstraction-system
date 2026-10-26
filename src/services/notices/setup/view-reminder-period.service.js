/**
 * Orchestrates fetching and presenting the data needed for the notices setup reminder periods page
 * @module ViewReminderPeriodService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import FetchReturnsReminderPeriods from '../../../dal/notices/setup/fetch-returns-reminder-periods.dal.js'
import ReminderPeriodPresenter from '../../../presenters/notices/setup/reminder-period.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup invitation periods page
 *
 * @param {string} sessionId - The UUID for setup returns notification session record
 *
 * @returns {Promise<object>} The view data for the invitation periods page
 */
export default async function viewInvitationPeriodService(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const returnCycles = await FetchReturnsReminderPeriods()

  const formattedData = ReminderPeriodPresenter(session, returnCycles)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}
