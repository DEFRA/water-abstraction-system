'use strict'

/**
 * Controller for /address endpoints
 * @module AddressController
 */

const InternationalAddressService = require('../services/address/international.service.js')
const ManualAddressService = require('../services/address/manual.service.js')
const PostcodeService = require('../services/address/postcode.service.js')
const SelectAddressService = require('../services/address/select.service.js')
const SubmitInternationalAddressService = require('../services/address/submit-international.service.js')
const SubmitManualAddressService = require('../services/address/submit-manual.service.js')
const SubmitPostcodeService = require('../services/address/submit-postcode.service.js')
const SubmitSelectAddressService = require('../services/address/submit-select.service.js')

async function submitInternational(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitInternationalAddressService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('address/international.njk', pageData)
  }

  // TODO: return to calling service
  return h.redirect(`/system/address/${sessionId}/check`)
}

async function submitManual(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitManualAddressService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('address/manual.njk', pageData)
  }

  // TODO: return to calling service
  return h.redirect(`/system/address/${sessionId}/check`)
}

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

  if (pageData.redirect) {
    return h.redirect(`/system/address/${sessionId}/manual`)
  }

  if (pageData.error) {
    return h.view('address/select.njk', pageData)
  }

  // TODO: Update to return to which ever journey is using the address lookup service
  return h.redirect(`/system/address/${sessionId}/check`)
}

async function viewInternational(request, h) {
  const { sessionId } = request.params

  const pageData = await InternationalAddressService.go(sessionId)

  return h.view('address/international.njk', pageData)
}

async function viewManual(request, h) {
  const { sessionId } = request.params

  const pageData = await ManualAddressService.go(sessionId)

  return h.view('address/manual.njk', pageData)
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
  submitInternational,
  submitManual,
  submitPostcode,
  submitSelect,
  viewInternational,
  viewManual,
  viewPostcode,
  viewSelect
}
