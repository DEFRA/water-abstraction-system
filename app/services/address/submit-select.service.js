'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/select` page
 *
 * @module SubmitSelectService
 */

const LookupPostcodeRequest = require('../../requests/address-facade/lookup-postcode.request.js')
const LookupUPRNRequest = require('../../requests/address-facade/lookup-uprn.request.js')
const SelectPresenter = require('../../presenters/address/select.presenter.js')
const SelectValidator = require('../../validators/address/select.validator.js')
const SessionModel = require('../../models/session.model.js')
const { formatValidationResult } = require('../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/select` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const error = _validate(payload)

  if (!error) {
    const uprnResult = await LookupUPRNRequest.send(payload.addresses)

    // NOTE: Handle the edge case that having selected a valid address, our call to the address facade fails. When this
    // happens we fall back to asking the user to enter the address manually
    if (!uprnResult.succeeded || uprnResult.matches.length === 0) {
      return {
        redirect: `/system/address/${session.id}/manual`
      }
    }

    await _save(session, uprnResult.matches[0])

    return {
      redirect: session.addressJourney.redirectUrl
    }
  }

  const postcodeResult = await LookupPostcodeRequest.send(session.addressJourney.address.postcode)

  // NOTE: Another edge case. The user forgot to select an address and hit submit. So, we need to lookup the matching
  // addresses by postcode again, only this time the request fails. Again, we simply fallback to entering it manually
  if (postcodeResult.succeeded === false || postcodeResult.matches.length === 0) {
    return {
      redirect: `/system/address/${session.id}/manual`
    }
  }

  const pageData = SelectPresenter.go(session, postcodeResult.matches)

  return {
    error,
    ...pageData
  }
}

async function _save(session, address) {
  const mappedAddress = { uprn: address.uprn }

  const premises = address.premises ?? ''
  const streetAddress = address.street_address ?? ''

  const premisesStreetAddress = `${premises} ${streetAddress}`.trim()

  if (!address.organisation) {
    mappedAddress.addressLine1 = premisesStreetAddress
    mappedAddress.addressLine2 = null
  } else {
    mappedAddress.addressLine1 = address.organisation
    mappedAddress.addressLine2 = premisesStreetAddress
  }

  mappedAddress.addressLine3 = address.locality ?? null
  mappedAddress.addressLine4 = address.city
  mappedAddress.postcode = address.postcode

  session.addressJourney.address = mappedAddress

  return session.$update()
}

function _validate(payload) {
  const validationResult = SelectValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
