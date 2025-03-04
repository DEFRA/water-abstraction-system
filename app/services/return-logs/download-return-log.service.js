'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the return log download link
 * @module DownloadReturnLogService
 */

const DownloadReturnLogPresenter = require('../../presenters/return-logs/download-return-log.presenter.js')
const FetchDownloadReturnLogService = require('./fetch-download-return-log.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the return log download link
 *
 * This service created a csv file for a returns monthly abstraction volumes. It does not seem necessary to use a `Stream`
 * to create the csv as the data is relatively small.
 *
 * @param {string} returnLogId - The UUID of the return
 * @param {string} version - The version number of the return
 *
 * @returns {Promise<object>} The data for the download return log link (csv string, filename and type)
 */
async function go(returnLogId, version) {
  const returnLog = await FetchDownloadReturnLogService.go(returnLogId, version)

  const { data, filename } = DownloadReturnLogPresenter.go(returnLog)

  return {
    data,
    type: 'text/csv',
    filename
  }
}

module.exports = {
  go
}
