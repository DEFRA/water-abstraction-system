'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the download report link
 * @module DownloadReturnLogSubmissionsService
 */

const DownloadReturnLogSubmissionsPresenter = require('../../presenters/reporting/download-return-log-submissions.presenter.js')
const FetchReturnLogSubmissionsService = require('./fetch-return-log-submissions.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the download report link
 *
 * This service creates a csv file of return submissions for the user to download.
 *
 * @returns {Promise<object>} The data for the download link (csv string, filename and type)
 */
async function go() {
  const licenceRef = '03/28/80/0029'
  const returnLogSubmissions = await FetchReturnLogSubmissionsService.go(licenceRef)

  const formattedData = DownloadReturnLogSubmissionsPresenter.go(returnLogSubmissions)

  return {
    data: formattedData,
    type: 'text/csv',
    filename: 'return-submissions.csv'
  }
}

module.exports = {
  go
}
