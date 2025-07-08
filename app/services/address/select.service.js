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
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const addresses = await LookupPostcodeRequest.send(session.address.postcode)

  if (addresses.succeeded === false || addresses.results.length === 0) {
    return {
      redirect: true
    }
  }

  const pageData = SelectPresenter.go(addresses.results)

  return {
    backLink: `/system/address/${session.id}/postcode`,
    sessionId: session.id,
    ...pageData
  }
}

module.exports = {
  go
}
