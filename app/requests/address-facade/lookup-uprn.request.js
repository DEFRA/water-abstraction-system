'use strict'

/**
 * Sends a request to the address facade for the provided uprn
 * @module LookupUPRNRequest
 */

const AddressFacadeRequest = require('../address-facade.request.js')

/**
 * Sends a request to the address facade for the provided uprn
 *
 * @param {string} uprn - The UPRN to look up addresses for
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(uprn) {
  const path = `address-service/v1/addresses/${uprn}?key=client1`

  return AddressFacadeRequest.get(path)
}

module.exports = {
  send
}
