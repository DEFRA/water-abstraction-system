/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @module ViewContactTypeService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import ContactTypePresenter from '../../../presenters/notices/setup/contact-type.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function viewContactTypeService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = ContactTypePresenter(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
