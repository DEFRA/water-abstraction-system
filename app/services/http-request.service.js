'use strict'

/**
 * Handles all GET http requests to other services
 * @module HttpRequestService
 */

const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')

const requestConfig = require('../../config/request.config.js')

async function go (url) {
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
    const options = _requestOptions(url)
    console.log('🚀 ~ file: http-request.service.js:25 ~ go ~ options', options)

    result.response = await got.get(url, options)
    // If the result is not 2xx or 3xx Got will mark the result as unsuccesful using the response object's `ok:`
    // property
    result.succeeded = result.response.ok
  } catch (error) {
    console.log('🚀 ~ file: http-request.service.js:32 ~ go ~ error', error)
    result.response = error
  }

  return result
}

function _requestAgent (url) {
  const urlObject = new URL(url)

  if (urlObject.protocol === 'https:') {
    console.log('🚀 ~ file: http-request.service.js ~ _requestAgent ~ httpsProxy', requestConfig.httpsProxy)
    return new HttpsProxyAgent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256,
      scheduling: 'lifo',
      proxy: requestConfig.httpsProxy
    })
  }

  console.log('🚀 ~ file: http-request.service.js ~ _requestAgent ~ httpProxy', requestConfig.httpProxy)
  return new HttpProxyAgent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 256,
    maxFreeSockets: 256,
    scheduling: 'lifo',
    proxy: requestConfig.httpProxy
  })
}

function _requestOptions (url) {
  const options = {
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

  if (requestConfig.httpProxy) {
    options.agent = {
      http: _requestAgent(url)
    }
  }

  return options
}

module.exports = {
  go
}
