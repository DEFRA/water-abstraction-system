'use strict'

/**
 * Plugin that handles logging for the application
 *
 * {@link https://github.com/pinojs/hapi-pino|hapi-pino} wraps the
 * {@link https://github.com/pinojs/pino#low-overhead|pino} Node JSON logger as a logger for Hapi. We pretty much use it
 * as provided with its defaults.
 *
 * @module HapiPinoPlugin
 */

const HapiPino = require('hapi-pino')

const HapiPinoIgnoreRequestService = require('../services/plugins/hapi-pino-ignore-request.service.js')
const HapiPinoLogInTestService = require('../services/plugins/hapi-pino-log-in-test.service.js')
const HapiPinoSerializersService = require('../services/plugins/hapi-pino-serializers.service.js')

const LogConfig = require('../../config/log.config.js')

const HapiPinoPlugin = () => {
  return {
    plugin: HapiPino,
    options: {
      // Include our test configuration
      ...HapiPinoLogInTestService.go(LogConfig.logInTest),
      // When not in the production environment we want a 'pretty' version of the JSON to make it easier to grok what
      // has happened
      transport:
        process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
      // Redact Authorization headers, see https://getpino.io/#/docs/redaction
      redact: ['req.headers.authorization'],
      // Adding this here means it will be passed to HapiPinoIgnoreRequestService.go() within the `options` arg when
      // Hapi-pino uses the ignoreFunc property
      logAssetRequests: LogConfig.logAssetRequests,
      // We want our logs to focus on the main requests and not become full of 'noise' from requests for /assets or
      // pings from the AWS load balancer to /status. We pass this function to hapi-pino to control what gets filtered
      // https://github.com/pinojs/hapi-pino#optionsignorefunc-options-request--boolean
      ignoreFunc: HapiPinoIgnoreRequestService.go,
      // Add the request params as pathParams to the response event log. This, along with `logPathParams` and
      // `logQueryParams` helps us see what data was sent in the request to the app in the event of an error.
      logPathParams: true,
      // Add the request payload as `payload:` to the response event log
      logPayload: true,
      // Add the request query as `queryParams:` to the response event log
      logQueryParams: true,
      serializers: HapiPinoSerializersService.go()
    }
  }
}

module.exports = HapiPinoPlugin
