/**
 * Orchestrates cancelling the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @module SubmitCancelService
 */

import DeleteSessionDal from '../../../dal/delete-session.dal.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates cancelling the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  await DeleteSessionDal(sessionId)

  const { company, companyContact } = session

  if (companyContact) {
    return {
      redirectUrl: `/system/company-contacts/${companyContact.id}/contact-details`
    }
  }

  return {
    redirectUrl: `/system/companies/${company.id}/contacts`
  }
}
