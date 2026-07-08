/**
 * Orchestrates fetching and presenting the data for the '/bill-runs/review/licence/{reviewLicenceId}/remove' page
 * @module ViewRemoveService
 */

import FetchRemoveReviewLicenceService from './fetch-remove-review-licence.service.js'
import RemovePresenter from '../../../presenters/bill-runs/review/remove.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/bill-runs/review/licence/{reviewLicenceId}/remove' page
 *
 * @param {string} reviewLicenceId - The UUID of the licence that is being removed from the bill run
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(reviewLicenceId) {
  const reviewLicence = await FetchRemoveReviewLicenceService(reviewLicenceId)

  const pageData = RemovePresenter.go(reviewLicence)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}
