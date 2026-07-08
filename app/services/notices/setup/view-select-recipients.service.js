/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @module ViewSelectRecipientsService
 */

import FetchRecipientsService from './fetch-recipients.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SelectRecipientsPresenter from '../../../presenters/notices/setup/select-recipients.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const selectedRecipients = _selectedRecipients(session)

  const recipients = await FetchRecipientsService.go(session)

  const pageData = SelectRecipientsPresenter.go(session, recipients, selectedRecipients)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

/**
 * Clear the 'selectedRecipients' from the session to fetch all the recipients
 *
 * Return the current selected recipients to mark as 'checked' on the page
 *
 * @private
 */
function _selectedRecipients(session) {
  const selectedRecipients = session.selectedRecipients

  delete session.selectedRecipients

  return selectedRecipients
}

export { go }
export default {
  go
}
