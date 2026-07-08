/**
 * Orchestrates fetching and presenting the data needed for the view return submission page
 * @module ViewReturnSubmissionService
 */

import FetchReturnSubmissionService from './fetch-return-submission.service.js'
import ViewReturnSubmissionPresenter from '../../presenters/return-submissions/view-return-submission.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the view return submission page
 *
 * @param {string} returnSubmissionId - The ID of the return submission to view
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view return submission template.
 */
export default async function go(returnSubmissionId, yearMonth) {
  const returnSubmission = await FetchReturnSubmissionService(returnSubmissionId)

  const pageData = ViewReturnSubmissionPresenter(returnSubmission, yearMonth)

  return {
    ...pageData
  }
}
