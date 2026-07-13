/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @module SelectAddressService
 */

import FetchSessionDal from '../../dal/fetch-session.dal.js'
import { send } from '../../requests/address-facade/lookup-postcode.request.js'
import SelectPresenter from '../../presenters/address/select.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function selectService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const result = await send(session.addressJourney.address.postcode)

  if (result.succeeded === false || result.matches.length === 0) {
    return {
      redirect: true
    }
  }

  return SelectPresenter(session, result.matches)
}
