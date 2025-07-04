'use strict'

/**
 * Use for making http requests to the address facade
 * @module LookupPostcodeRequest
 */

const BaseRequest = require('../base.request.js')

const requestConfig = require('../../../config/request.config.js')
const servicesConfig = require('../../../config/services.config.js')

/**
 * Sends a request to the address facade for the provided postcode
 *
 * @param {string} postcode - The postcode to look up addresses for
 *
 * @returns {Promise<object[]>} An array of found addresses
 */
async function send(postcode) {
  const uri = `address-service/v1/addresses/postcode?query-string=${postcode}&key=client1`
  const result = await BaseRequest.get(uri, _requestOptions())

  return {
    succeeded: result.succeeded,
    results: result?.response?.body?.results || []
  }
}

/**
 * Additional options that will be added to the default options used by BaseRequest
 *
 * We use it to set
 *
 * - the base address facade URL for all requests
 * - the option to tell Got that we expect JSON responses. This means Got will automatically handle parsing the
 *   response to a JSON object for us
 *
 * @private
 */
function _requestOptions() {
  return {
    prefixUrl: servicesConfig.addressFacade.url,
    responseType: 'json',
    timeout: {
      request: requestConfig.timeout
    }
  }
}

module.exports = {
  send
}
