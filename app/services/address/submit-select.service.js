/**
 * Orchestrates validating the data for `address/{sessionId}/select` page
 *
 * @module SubmitSelectService
 */

import FetchSessionDal from '../../dal/fetch-session.dal.js'
import { send as lookupPostcode } from '../../requests/address-facade/lookup-postcode.request.js'
import { send as lookupUprn } from '../../requests/address-facade/lookup-uprn.request.js'
import SelectPresenter from '../../presenters/address/select.presenter.js'
import SelectValidator from '../../validators/address/select.validator.js'
import { formatValidationResult } from '../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for `address/{sessionId}/select` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const error = _validate(payload)

  if (!error) {
    const uprnResult = await lookupUprn(payload.addresses)

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

  const postcodeResult = await lookupPostcode(session.addressJourney.address.postcode)

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

  if (address.organisation) {
    mappedAddress.addressLine1 = address.organisation
    mappedAddress.addressLine2 = premisesStreetAddress
  } else {
    mappedAddress.addressLine1 = premisesStreetAddress
    mappedAddress.addressLine2 = null
  }

  mappedAddress.addressLine3 = address.locality ?? null
  mappedAddress.addressLine4 = address.city
  mappedAddress.postcode = address.postcode

  session.addressJourney.address = mappedAddress
  session.addressJourney.backUrl = `/system/address/${session.id}/select`

  return session.$update()
}

function _validate(payload) {
  const validationResult = SelectValidator.go(payload)

  return formatValidationResult(validationResult)
}

export { go }
export default {
  go
}
