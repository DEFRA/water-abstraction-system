/**
 * Orchestrates fetching and presenting the data for the '/bill-runs/review/{id}' page
 * @module ViewReviewService
 */

import FetchBillRunLicencesService from './fetch-bill-run-licences.service.js'
import PaginatorPresenter from '../../../presenters/paginator.presenter.js'
import ReviewPresenter from '../../../presenters/bill-runs/review/review.presenter.js'
import { readFlashNotification } from '../../../lib/general.lib.js'
import { processSavedFilters } from '../../../lib/submit-page.lib.js'

/**
 * Orchestrates fetching and presenting the data for the '/bill-runs/review/{id}' page
 *
 * @param {string} id - The UUID for the bill run to review
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewReview(id, yar, page) {
  const filterKey = `review-${id}`
  const filters = _filters(yar, filterKey)

  const { billRun, licences } = await FetchBillRunLicencesService(id, filters, page)

  const notification = readFlashNotification(yar)

  const pageData = ReviewPresenter(billRun, licences.results)

  const pagination = PaginatorPresenter(
    licences.total,
    page,
    `/system/bill-runs/review/${id}`,
    licences.results.length,
    'licences'
  )

  return {
    activeNavBar: 'bill-runs',
    filters,
    notification,
    ...pageData,
    pagination
  }
}

function _filters(yar, filterKey) {
  const savedFilters = processSavedFilters(yar, filterKey)

  return {
    issues: [],
    licenceHolderNumber: null,
    licenceStatus: null,
    progress: [],
    ...savedFilters
  }
}
