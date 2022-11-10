'use strict'

/**
 * @module HttpRequestService
 */

const requestConfig = require('../../config/request.config.js')

class HttpRequestService {
  static async go (url) {
    // As of v12, the got dependency no longer supports CJS modules. This causes us a problem as we are locked into
    // using these for the time being. Some workarounds are provided here:
    // https://github.com/sindresorhus/got/issues/1789 We have gone the route of using await import('got'). We cannot do
    // this at the top level as Node doesn't support top level in CJS so we do it here instead.
    const { got } = await import('got')
    const result = {
      succeeded: false,
      response: null
    }

    try {
      result.response = await got.get(url, this._requestOptions())
      // If the result is not 2xx or 3xx Got will mark the result as unsuccesful using the response object's `ok:`
      // propertry
      result.succeeded = result.response.ok
    } catch (error) {
      result.response = error
    }

    return result
  }

  static _requestOptions () {
    return {
      // If we don't have this setting Got will throw its own HTTPError unless the result is 2xx or 3xx. That makes it
      // harder to see what the status code was because it doesn't get set on the response object for errors.
      throwHttpErrors: false,
      retry: {
        // We ensure that the only network errors Got retries are timeout errors
        errorCodes: ['ETIMEDOUT'],
        // We set statusCodes as an empty array to ensure that 4xx, 5xx etc. errors are not retried
        statusCodes: []
      },
      timeout: {
        request: requestConfig.requestTimeout
      }
    }
  }
}

module.exports = HttpRequestService
