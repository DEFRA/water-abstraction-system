/**
 * Orchestrates fetching and presenting the data for the '' page
 *
 * @module __MODULE_NAME__
 */

import FetchSessionDal from '__FETCH_SESSION_DAL_PATH__'
import __PRESENTER_NAME__ from '__PRESENTER_PATH__'

/**
 * Orchestrates fetching and presenting the data for the '' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function __FUNCTION_NAME__(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = __PRESENTER_NAME__(session)

  return {
    ...pageData
  }
}
