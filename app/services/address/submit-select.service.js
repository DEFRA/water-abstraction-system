'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/select` page
 *
 * @module SubmitSelectService
 */

const LookupPostcodeRequest = require('../../requests/address-lookup/lookup-postcode.request.js')
const LookupUPRNRequest = require('../../requests/address-lookup/lookup-uprn.request.js')
const SelectPresenter = require('../../presenters/address/select.presenter.js')
const SelectValidator = require('../../validators/address/select.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/select` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  let validationResult = _validate(payload)

  if (!validationResult) {
    const address = await LookupUPRNRequest.send(payload.addresses.value)

    if (address.succeeded) {
      await _save(session, address.results[0])

      return {}
    }

    validationResult = {
      text: 'Address not found'
    }
  }

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
    error: validationResult,
    ...pageData
  }
}

async function _save(session, address) {
  session.address.uprn = address.uprn
  session.address.addressLine1 = address.organisation
  session.address.addressLine2 = address.premises
  session.address.addressLine3 = address.street_address
  session.address.addressLine4 = address.locality
  session.address.town = address.city
  session.address.postcode = address.postcode
  session.address.country = address.country

  return session.$update()
}

function _validate(payload) {
  const validation = SelectValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
