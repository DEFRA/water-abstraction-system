'use strict'

/**
 * Controller for /address endpoints
 * @module AddressController
 */

const PostcodeService = require('../services/address/postcode.service.js')
const SelectAddressService = require('../services/address/select.service.js')
const SubmitPostcodeService = require('../services/address/submit-postcode.service.js')
const SubmitSelectAddressService = require('../services/address/submit-select.service.js')

async function submitPostcode(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitPostcodeService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('address/postcode.njk', pageData)
  }

  return h.redirect(`/system/address/${sessionId}/select`)
}

async function submitSelect(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSelectAddressService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('address/select.njk', pageData)
  }

  return h.redirect(`/system/address/${sessionId}/select`)
}

async function viewPostcode(request, h) {
  const { sessionId } = request.params

  const pageData = await PostcodeService.go(sessionId)

  return h.view('address/postcode.njk', pageData)
}

async function viewSelect(request, h) {
  const { sessionId } = request.params

  const pageData = await SelectAddressService.go(sessionId)

  if (pageData.redirect) {
    return h.redirect(`/system/address/${sessionId}/manual`)
  }

  return h.view('address/select.njk', pageData)
}

module.exports = {
  submitPostcode,
  submitSelect,
  viewPostcode,
  viewSelect
}
