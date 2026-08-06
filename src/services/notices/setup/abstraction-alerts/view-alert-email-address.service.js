/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @module ViewAlertEmailAddressService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import AlertEmailAddressPresenter from '../../../../presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {string} sessionId - The UUID for the current session
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function viewAlertEmailAddressService(sessionId, auth) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AlertEmailAddressPresenter(session, auth)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
