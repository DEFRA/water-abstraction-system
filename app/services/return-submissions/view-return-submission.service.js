'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view return submission page
 * @module ViewReturnSubmissionService
 */

const FetchReturnSubmissionService = require('./fetch-return-submission.service.js')
const ViewReturnSubmissionPresenter = require('../../presenters/return-submissions/view-return-submission.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view return submission page
 *
 * @param {string} returnSubmissionId - The ID of the return submission to view
 * @param {number} monthIndex - The zero-indexed month to view
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view return submission template.
 */
async function go(returnSubmissionId, monthIndex) {
  const returnSubmission = await FetchReturnSubmissionService.go(returnSubmissionId)

  const pageData = ViewReturnSubmissionPresenter.go(returnSubmission, monthIndex)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
