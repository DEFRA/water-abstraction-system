'use strict'

/**
 * Use for making http requests to other services
 * @module BaseRequest
 */

const { HttpsProxyAgent } = require('hpagent')

const requestConfig = require('../../config/request.config.js')

/**
 * Returns an object containing the default options.
 *
 * We want to be able to export these options so we can set specific settings that may be multiple objects deep. For
 * example, if we want to set `retry.backoffLimit` then we can't simply pass `{ retry: { backoffLimit: 5 } }` to the lib
 * as `additionalOptions` as this would replace the entire `retry` section. We would therefore want to get the exported
 * `retry` section and add our setting to it before passing it back as `additionalOptions`.
 *
 * Note that we have a function here rather than defining a const as this did not allow us to override settings using
 * Sinon to stub `requestConfig`; the const appeared to have its values fixed when the file was required, whereas a
 * function generates its values each time it's called.
 *
 * @returns {object} default options to pass to Got when making a request
 */
function defaultOptions () {
  return {
    // This uses the ternary operator to give either an `agent` object or an empty object, and the spread operator to
    // bring the result back into the top level of the `defaultOptions` object.
    ...(requestConfig.httpProxy
      ? {
          agent: {
            https: new HttpsProxyAgent({ proxy: requestConfig.httpProxy })
          }
        }
      : {}),
    // If we don't have this setting Got will throw its own HTTPError unless the result is 2xx or 3xx. That makes it
    // impossible to see what the status code was because it doesn't get set on the response object Got provides when
    // an error is thrown. With this set Got will treat a 404 in the same way it treats a 204.
    throwHttpErrors: false,
    // Got has a built in retry mechanism. We have found though you have to be careful with what gets retried. Our
    // preference is to only retry in the event of a timeout on assumption the destination server might be busy but has
    // a chance to succeed when attempted again
    retry: {
      // The default is also 2 retries before erroring. We specify it to make this fact visible
      limit: 2,
      // We ensure that the only network errors Got retries are timeout and econnreset errors. Both can be a result of
      // the other side being overloaded which can happen when we are trying to send high volumes of requests, for
      // example, when creating a bill run
      errorCodes: ['ECONNRESET', 'ETIMEDOUT'],
      // By default, Got does not retry PATCH and POST requests. As we only retry certain errors there is no risk in
      // retrying our PATCH and POST requests. So, we set the methods to be Got's defaults plus 'PATCH' and 'POST'
      methods: ['GET', 'PATCH', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
      // We set statusCodes as an empty array to ensure that 4xx, 5xx etc. errors are not retried
      statusCodes: []
    },
    // Got states
    //
    // > It is a good practice to set a timeout to prevent hanging requests. By default, there is no timeout set.
    timeout: {
      request: requestConfig.timeout
    },
    hooks: {
      beforeRetry: [
        _beforeRetryHook
      ]
    }
  }
}

/**
 * Make a DELETE request to the specified URL
 *
 * > Note: This function has been called `deleteRequest` here rather than `delete` as `delete` is a reserved word.
 *
 * @param {string} url - The full URL that you wish to connect to
 * @param {object} additionalOptions - Append to or replace the options passed to Got when making the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function deleteRequest (url, additionalOptions = {}) {
  return _sendRequest('delete', url, additionalOptions)
}

/**
 * Make a GET request to the specified URL
 *
 * Use when you need to make a GET request. It returns a result tuple
 *
 * ```javascript
 * {
 *  succeeded: true,
 *  response: {} // The full response from Got
 * }
 * ```
 *
 * Any 2xx or 3xx will be flagged as succeeded. Anything else and `succeeded:` will be false. As long as the other
 * service responds, `response:` will be the full response Got returns. In the event of a network error `response:` will
 * be a Got error instance.
 *
 * @param {string} url - The full URL that you wish to connect to
 * @param {object} additionalOptions - Append to or replace the options passed to Got when making the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function get (url, additionalOptions = {}) {
  return _sendRequest('get', url, additionalOptions)
}

/**
 * Make a PATCH request to the specified URL
 *
 * Use when you need to make a PATCH request. It returns a result tuple:
 *
 * ```javascript
 * {
 *  succeeded: true,
 *  response: {} // The full response from Got
 * }
 * ```
 *
 * Any 2xx or 3xx will be flagged as succeeded. Anything else and `succeeded:` will be false. As long as the other
 * service responds, `response:` will be the full response Got returns. In the event of a network error `response:`
 * will be a Got error instance.
 *
 * @param {string} url - The full URL that you wish to connect to
 * @param {object} additionalOptions - Append to or replace the options passed to Got when making the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function patch (url, additionalOptions = {}) {
  return _sendRequest('patch', url, additionalOptions)
}

/**
 * Make a POST request to the specified URL
 *
 * Use when you need to make a POST request. It returns a result tuple:
 *
 * ```javascript
 * {
 *  succeeded: true,
 *  response: {} // The full response from Got
 * }
 * ```
 *
 * Any 2xx or 3xx will be flagged as succeeded. Anything else and `succeeded:` will be false. As long as the other
 * service responds, `response:` will be the full response Got returns. In the event of a network error `response:`
 * will be a Got error instance.
 *
 * @param {string} url - The full URL that you wish to connect to
 * @param {object} additionalOptions - Append to or replace the options passed to Got when making the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function post (url, additionalOptions = {}) {
  return _sendRequest('post', url, additionalOptions)
}

function _beforeRetryHook (error, retryCount) {
  global.GlobalNotifier.omg('Retrying HTTP request', { error, retryCount })
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
 * Logs the failed request
 *
 * If the request failed because the external service returned a `4xx/5xx` response we just log the failure. We also
 * generate our own response object to avoid outputting the full response object Got generates.
 *
 * If the request failed because of an error, for example a timeout, then we both log and send a notification to our
 * Errbit instance. We also output the full response to the log as it will be the Got error containing all the info
 * we need to diagnose the problem.
 *
 * @param {string} method - the type of request made, for example, 'GET', 'POST, or 'PATCH'
 * @param {object} result - the result object we generate
 * @param {string} url - the requested url
 * @param {object} additionalOptions - any additional options that were passed to Got by the calling service
 *
 * @private
 */
function _logFailure (method, result, url, additionalOptions) {
  const data = {
    method,
    url,
    additionalOptions
  }

  if (result.response instanceof Error) {
    data.result = result
    global.GlobalNotifier.omfg(`${method} request errored`, data)

    return
  }

  data.result = {
    succeeded: result.succeeded,
    response: {
      statusCode: result.response.statusCode,
      body: result.response.body
    }
  }

  global.GlobalNotifier.omg(`${method} request failed`, data)
}

/**
 * Combines the custom Got options provided by the caller with our defaults
 *
 * Those that use this module can add to, extend or replace the options we pass to Got when a request is made.
 *
 * @param {object} additionalOptions - Object of custom options
 *
 * @private
 */
function _requestOptions (additionalOptions) {
  return { ...defaultOptions(), ...additionalOptions }
}

async function _sendRequest (method, url, additionalOptions) {
  const got = await _importGot()
  const result = {
    succeeded: false,
    response: null
  }

  try {
    const options = _requestOptions(additionalOptions)

    result.response = await got[method](url, options)

    // If the result is not 2xx or 3xx Got will mark the result as unsuccessful using the response object's `ok:`
    // property
    result.succeeded = result.response.ok
  } catch (error) {
    // If it's a network error, for example 'ETIMEDOUT', we'll end up here
    result.response = error
  }

  if (!result.succeeded) {
    _logFailure(method.toUpperCase(), result, url, additionalOptions)
  }

  return result
}

module.exports = {
  delete: deleteRequest,
  get,
  patch,
  post,
  defaultOptions: defaultOptions()
}
