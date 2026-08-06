/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import AbstractionPeriodPresenter from '../../../presenters/return-versions/setup/abstraction-period.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/abstraction-period` page
 *
 * Supports generating the data needed for the abstraction period page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the abstraction period page
 */
export default async function abstractionPeriodService(sessionId, requirementIndex) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = AbstractionPeriodPresenter(session, requirementIndex)

  return {
    ...formattedData
  }
}
