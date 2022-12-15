'use strict'

/**
 * @module RequestLib
 */

const { HttpsProxyAgent } = require('hpagent')

const requestConfig = require('../../config/request.config.js')

async function get (url, additionalOptions = {}) {
  const got = await _importGot()
  const result = {
    succeeded: false,
    response: null
  }

  try {
    const options = _requestOptions(additionalOptions)

    result.response = await got.get(url, options)

    // If the result is not 2xx or 3xx Got will mark the result as unsuccesful using the response object's `ok:`
    // property
    result.succeeded = result.response.ok
  } catch (error) {
    // If it's a network error, for example 'ETIMEDOUT', we'll end up here
    result.response = error
  }

  return result
}

async function _importGot () {
  // As of v12, the got dependency no longer supports CJS modules. This causes us a problem as we are locked into
  // using these for the time being. Some workarounds are provided here:
  // https://github.com/sindresorhus/got/issues/1789 We have gone the route of using await import('got'). We cannot do
  // this at the top level as Node doesn't support top level in CJS so we do it here instead.
  const { got } = await import('got')

  return got
}

/**
 * Combines the custom Got options provided by the caller with our defaults
 *
 * Those that use this module can add to, extend or replace the options we pass to Got when a request is made.
 *
 * @param {Object} additionalOptions Object of custom options
 */
function _requestOptions (additionalOptions) {
  const defaultOptions = {
    // This uses the spread operator and a logical AND short circuit evaluation to allow us to determine whether the
    // following columns are added to the options or not. Thanks to https://stackoverflow.com/a/40560953/6117745 for
    // this
    ...(requestConfig.httpProxy && {
      agent: {
        https: new HttpsProxyAgent({ proxy: requestConfig.httpProxy })
      }
    }),
    // If we don't have this setting Got will throw its own HTTPError unless the result is 2xx or 3xx. That makes it
    // impossible to see what the status code was because it doesn't get set on the response object Got provides when
    // an error is thrown. With this set Got will treat a 404 in the same way it treats a 204.
    throwHttpErrors: false,
    // Got has a built in retry mechanism. We have found though you have to be careful with what gets retried. Our
    // preference is to only retry in the event of a timeout on assumption the destination server might be busy but has
    // a chance to succeed when attempted again
    retry: {
      // We ensure that the only network errors Got retries are timeout errors
      errorCodes: ['ETIMEDOUT'],
      // We set statusCodes as an empty array to ensure that 4xx, 5xx etc. errors are not retried
      statusCodes: []
    },
    // Got states
    //
    // > It is a good practice to set a timeout to prevent hanging requests. By default, there is no timeout set.
    timeout: {
      request: requestConfig.timeout
    }
  }

  // Copies properties from one object to another; Object.assign(target, source). Matching properties get overriden
  return Object.assign(defaultOptions, additionalOptions)
}

module.exports = {
  get
}
