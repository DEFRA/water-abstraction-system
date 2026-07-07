/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module ViewCheckService
 */

import CheckPresenter from '../../../presenters/company-contacts/setup/check.presenter.js'
import FetchCompanyContactsDal from '../../../dal/company-contacts/setup/fetch-company-contacts.dal.js'
import FetchNotificationService from '../fetch-notification.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { markCheckPageVisited } from '../../../lib/check-page.lib.js'
import { readFlashNotification } from '../../../lib/general.lib.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const companyContacts = await FetchCompanyContactsDal.go(session.company.id, session.companyContact)

  const sentNotification = await FetchNotificationService.go(session.email)

  await markCheckPageVisited(session)

  const pageData = CheckPresenter.go(session, companyContacts, sentNotification)

  const notification = readFlashNotification(yar)

  await _save(session, pageData.matchingContact)

  return {
    ...pageData,
    notification
  }
}

async function _save(session, matchingContact) {
  if (matchingContact) {
    session.matchingContact = matchingContact
    await session.$update()
  }
}

export {
  go
}
export default {
  go
}
