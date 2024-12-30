'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the how to edit an abstraction return page
 * @module EditReturnLogService
 */

const FetchEditReturnLogService = require('./fetch-edit-return-log.service.js')
const EditReturnLogPresenter = require('../../presenters/return-logs/edit-return-log.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the how to edit an abstraction return page
 *
 * @param {string} returnLogId - The ID of the return log to edit
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(returnLogId) {
  const editReturnLog = await FetchEditReturnLogService.go(returnLogId)
  const pageData = EditReturnLogPresenter.go(editReturnLog)

  return pageData
}

module.exports = {
  go
}
