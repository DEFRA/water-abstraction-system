'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @module SelectService
 */

const BaseRequest = require('../../requests/base.request.js')
const SelectPresenter = require('../../presenters/address/select.presenter.js')
const SessionModel = require('../../models/session.model.js')
const servicesConfig = require('../../../config/services.config.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/select` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  try {
    const statusUrl = new URL(
      'address-service/v1/addresses/postcode?query-string=sw2%201an&key=client1',
      servicesConfig.addressFacade.url
    )
    const result = await BaseRequest.get(statusUrl.href)
    const resultJson = JSON.parse(result.response.body)
    console.log(resultJson.results[0])
  } catch (error) {
    console.log(error)
  }

  const pageData = SelectPresenter.go(session)

  return {
    pageTitle: 'Select the address',
    ...pageData
  }
}

module.exports = {
  go
}
