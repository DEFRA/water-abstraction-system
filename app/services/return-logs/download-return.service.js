'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the return download link
 * @module DownloadReturnService
 */

const DownloadReturnPresenter = require('../../presenters/return-logs/download-return.presenter.js')
const FetchDownloadReturnService = require('../../services/return-logs/fetch-download-return.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the return download link
 *
 * This service created a csv file for a returns monthly abstraction volumes. It does not seem necessary to use a `Stream`
 * to create the csv as the data is relatively small.
 *
 * @param {string} returnLogId - The UUID of the return
 * @param {string} version - The version number of the return
 *
 * @returns {Promise<object>} The data for the download link (csv string, filename and type)
 */
async function go(returnLogId, version) {
  const returnLog = await FetchDownloadReturnService.go(returnLogId, version)

  const { data, filename } = DownloadReturnPresenter.go(returnLog)

  return {
    data,
    type: 'text/csv',
    filename
  }
}

module.exports = {
  go
}
