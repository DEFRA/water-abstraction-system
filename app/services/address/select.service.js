'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @module SelectAddressService
 */

const LookupPostcodeRequest = require('../../requests/address-facade/lookup-postcode.request.js')
const SelectPresenter = require('../../presenters/address/select.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const result = await LookupPostcodeRequest.send(session.addressJourney.address.postcode)

  if (result.succeeded === false || result.matches.length === 0) {
    return {
      redirect: true
    }
  }

  return SelectPresenter.go(session, result.matches)
}

module.exports = {
  go
}
