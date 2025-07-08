'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/manual` page
 *
 * @module ManualService
 */

const ManualAddressPresenter = require('../../presenters/address/manual.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/manual` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
console.log(session.address)
  const pageData = ManualAddressPresenter.go(session.address)

  return {
    activeNavBar: 'search',
    backLink: _backLink(session.address, sessionId),
    ...pageData
  }
}

function _backLink(address, sessionId) {
  if (address.uprn) {
    return `/system/address/${sessionId}/select`
  }

  return `/system/address/${sessionId}/postcode`
}

module.exports = {
  go
}
