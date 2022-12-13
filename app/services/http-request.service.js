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
    const options = _requestOptions()
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

function _requestAgent () {
  const baseProxyOptions = {
    maxFreeSockets: 256,
    maxSockets: 256,
    keepAlive: false
  }

  const httpsProxyUrl = new URL(requestConfig.httpsProxy)
  const https = new HttpsProxyAgent({
    ...baseProxyOptions,
    proxy: {
      protocol: httpsProxyUrl.protocol,
      hostname: httpsProxyUrl.hostname,
      port: httpsProxyUrl.port,
      username: null,
      password: null,
    }
  })
  https.defaultPort = 3128

  const httpProxyUrl = new URL(requestConfig.httpProxy)
  const http = new HttpProxyAgent({
    ...baseProxyOptions,
    proxy: {
      protocol: httpProxyUrl.protocol,
      hostname: httpProxyUrl.hostname,
      port: httpProxyUrl.port,
      username: null,
      password: null,
    }
  })
  http.defaultPort = 3128

  console.log('🚀 ~ file: http-request.service.js:70 ~ _requestAgents ~ https', https)
  console.log('🚀 ~ file: http-request.service.js:71 ~ _requestAgents ~ https.proxy', https.proxy)
  console.log('🚀 ~ file: http-request.service.js:72 ~ _requestAgents ~ http', http)
  console.log('🚀 ~ file: http-request.service.js:73 ~ _requestAgents ~ http.proxy', http.proxy)

  return {
    http,
    https
  }
}

function _requestOptions () {
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
    options.agent = _requestAgent()
  }

  return options
}

module.exports = {
  go
}
