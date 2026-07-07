/**
 * Sends a request to the address facade for the provided postcode
 * @module LookupPostcodeRequest
 */

import AddressFacadeRequest from '../address-facade.request.js'

/**
 * Sends a request to the address facade for the provided postcode
 *
 * @param {string} postcode - The postcode to look up addresses for
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(postcode) {
  const path = `address-service/v1/addresses/postcode?query-string=${postcode}&key=client1`

  return AddressFacadeRequest.get(path)
}

export default {
  send
}
