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
 * @param {string} returnLogId - The UUID of the return log to download
 * @param {number} version - The version number of the return submission to download
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
