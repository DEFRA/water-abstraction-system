/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirmed` page
 * @module ConfirmedService
 */

import ConfirmedPresenter from '../../../presenters/return-logs/setup/confirmed.presenter.js'
import FetchReturnLogService from '../../../services/return-logs/setup/fetch-return-log.service.js'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/confirmed` page
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<object>} page data needed by the view template
 */
export default async function go(returnLogId) {
  const returnLog = await FetchReturnLogService(returnLogId)

  const formattedData = ConfirmedPresenter.go(returnLog)

  return {
    ...formattedData
  }
}
