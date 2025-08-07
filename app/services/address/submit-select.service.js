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
    const uprnResult = await LookupUPRNRequest.send(payload.addresses)

    if (uprnResult.succeeded) {
      console.log(session.address)
      await _save(session, uprnResult.matches[0])

      return {
        redirect: session.address.redirectUrl
      }
    }

    validationResult = {
      text: 'Address not found'
    }
  }

  const postcodeResult = await LookupPostcodeRequest.send(session.address.postcode)

  if (postcodeResult.succeeded === false || postcodeResult.matches.length === 0) {
    return {
      redirect: `/system/address/${session.id}/manual`
    }
  }

  const pageData = SelectPresenter.go(postcodeResult.matches)

  return {
    backLink: `/system/address/${session.id}/postcode`,
    sessionId: session.id,
    error: validationResult,
    ...pageData
  }
}

async function _save(session, address) {
  session.address.uprn = address.uprn

  const premiseseStreetAddress = address.premises + ' ' + address.street_address

  if (!address.organisation) {
    session.address.addressLine1 = premiseseStreetAddress.trim()
    session.address.addressLine2 = null
  } else {
    session.address.addressLine1 = address.organisation
    session.address.addressLine2 = premiseseStreetAddress.trim()
  }

  session.address.addressLine3 = address.locality ?? null
  session.address.addressLine4 = address.city
  session.address.postcode = address.postcode

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
