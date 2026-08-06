/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @module ViewAccountTypeService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import AccountTypePresenter from '../../../presenters/billing-accounts/setup/account-type.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewAccountTypeService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AccountTypePresenter(session)

  return {
    ...pageData
  }
}
