/**
 * Controller for /address endpoints
 * @module AddressController
 */

import InternationalAddressService from '../services/address/international.service.js'
import ManualAddressService from '../services/address/manual.service.js'
import PostcodeService from '../services/address/postcode.service.js'
import SelectAddressService from '../services/address/select.service.js'
import SubmitInternationalAddressService from '../services/address/submit-international.service.js'
import SubmitManualAddressService from '../services/address/submit-manual.service.js'
import SubmitPostcodeService from '../services/address/submit-postcode.service.js'
import SubmitSelectAddressService from '../services/address/submit-select.service.js'

export async function submitInternational(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitInternationalAddressService(sessionId, payload)

  if (pageData.error) {
    return h.view('address/international.njk', pageData)
  }

  return h.redirect(pageData.redirect)
}

export async function submitManual(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitManualAddressService(sessionId, payload)

  if (pageData.error) {
    return h.view('address/manual.njk', pageData)
  }

  return h.redirect(pageData.redirect)
}

export async function submitPostcode(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitPostcodeService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('address/postcode.njk', pageData)
  }

  return h.redirect(`/system/address/${sessionId}/select`)
}

export async function submitSelect(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitSelectAddressService(sessionId, payload)

  if (pageData.error) {
    return h.view('address/select.njk', pageData)
  }

  return h.redirect(pageData.redirect)
}

export async function viewInternational(request, h) {
  const { sessionId } = request.params

  const pageData = await InternationalAddressService(sessionId)

  return h.view('address/international.njk', pageData)
}

export async function viewManual(request, h) {
  const { sessionId } = request.params

  const pageData = await ManualAddressService(sessionId)

  return h.view('address/manual.njk', pageData)
}

export async function viewPostcode(request, h) {
  const { sessionId } = request.params

  const pageData = await PostcodeService(sessionId)

  return h.view('address/postcode.njk', pageData)
}

export async function viewSelect(request, h) {
  const { sessionId } = request.params

  const pageData = await SelectAddressService(sessionId)

  if (pageData.redirect) {
    return h.redirect(`/system/address/${sessionId}/manual`)
  }

  return h.view('address/select.njk', pageData)
}
