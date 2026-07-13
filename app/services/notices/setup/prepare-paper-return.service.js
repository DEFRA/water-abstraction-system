/**
 * Orchestrates fetching and presenting the data for the paper return
 *
 * @module PreparePaperReturnService
 */

import { send } from '../../../requests/gotenberg/generate-paper-return.request.js'
import PreparePaperReturnPresenter from '../../../presenters/notices/setup/prepare-paper-return.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the paper return
 *
 * We return the 'pageData' to be used when sending the notification. The legacy code relies on setting the
 * personalisation in the database (mainly the address and due dates).
 *
 * @param {object} notification - A paper return notification
 *
 * @returns {Promise<object>} - Resolves the response from the Gotenberg request wrapper
 */
export default async function preparePaperReturn(notification) {
  const pageData = PreparePaperReturnPresenter(notification)

  return send(pageData)
}
