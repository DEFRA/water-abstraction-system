'use strict'

/**
 * Sends a request to the address facade for the provided postcode
 * @module LookupPostcodeRequest
 */

const AddressFacadeRequest = require('../address-facade.request.js')

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

module.exports = {
  send
}
