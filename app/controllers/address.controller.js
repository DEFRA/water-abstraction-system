'use strict'

/**
 * Controller for /address endpoints
 * @module AddressController
 */

const PostcodeService = require('../services/address/postcode.service.js')
const SubmitPostcodeService = require('../services/address/submit-postcode.service.js')

async function postcode(request, h) {
  const { id: sessionId } = request.params

  const pageData = await PostcodeService.go(sessionId)

  return h.view('address/postcode.njk', pageData)
}

async function submitPostcode(request, h) {
  const { id: sessionId } = request.params

  const pageData = await SubmitPostcodeService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('address/postcode.njk', pageData)
  }

  return h.redirect(`/system/address/${sessionId}/lookup`)
}

module.exports = {
  postcode,
  submitPostcode
}
