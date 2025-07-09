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

  const result = await LookupPostcodeRequest.send(session.address.postcode)

  if (result.succeeded === false || result.matches.length === 0) {
    return {
      redirect: true
    }
  }

  const pageData = SelectPresenter.go(result.matches)

  return {
    backLink: `/system/address/${session.id}/postcode`,
    sessionId: session.id,
    ...pageData
  }
}

module.exports = {
  go
}
