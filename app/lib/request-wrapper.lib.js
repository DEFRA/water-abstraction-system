'use strict'

/**
 * Wraps the `got` HTTP client so that it mimics the interface of the deprecated `request` library.
 * @module RequestWrapperLib
 */

const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')

/**
 * Wraps the `got` HTTP client so that it mimics the interface of the deprecated `request` library, allowing it to be
 * used as a drop-in replacement. In our case, we use it with the Airbrake plugin, which expects `request` when using a
 * proxy.
 *
 * The returned function behaves like `request`:
 * - It can be called with either a URL string (for a GET request) or an options object.
 * - It accepts a callback with the signature `(error, response, body)`.
 * - It makes the HTTP request using `got` and invokes the callback with the result or an error.
 *
 * @param {object} [defaults={}] - Default options applied to every request.
 *
 * @returns {Promise<Function>} A function that mimics the `request` API.
 */
async function gotWrapper(defaults = {}) {
  // We use the `await import` workaround to allow us to use the ESM `got`
  const { got } = await import('got')

  // Return a function that mimics the `request` interface
  return async function requestLike(options, callback) {
    // `request` can be called with either a string URL for a GET request, or an options object
    if (typeof options === 'string') {
      options = { url: options }
    }

    const gotOptions = {
      method: options.method || defaults.method || 'GET',
      headers: { ...defaults.headers, ...options.headers },
      body: options.body || defaults.body,
      url: options.url || options.uri,
      agent: {
        http: new HttpProxyAgent({ proxy: defaults.proxy }),
        https: new HttpsProxyAgent({ proxy: defaults.proxy })
      },
      throwHttpErrors: false,
      responseType: 'text'
    }

    try {
      const response = await got(gotOptions)

      const returnedResponse = {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body
      }

      callback(null, returnedResponse, response.body)
    } catch (error) {
      callback(error, null, null)
    }
  }
}

module.exports = { gotWrapper }
