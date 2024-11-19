'use strict'

/**
 * Used by HapiPinoPlugin to determine which requests to log
 * @module HapiPinoLogInTestService
 */

/**
 * Returns test configuration options for the hapi-pino logger
 *
 * When we run our unit tests we don't want the output polluted by noise from the logger. So as a default we set the
 * configuration to tell hapi-pino to ignore all events.
 *
 * But there will be times when trying to diagnose an issue that we will want log output. So using an env var we can
 * override the default and tell hapi-pino to log everything as normal.
 *
 * @param {boolean} logInTest - True if we are running in a test environment
 *
 * @returns {object} an empty object or one containing Hapi-pino config to tell it not to log events
 */
function go (logInTest) {
  if (process.env.NODE_ENV !== 'test' || logInTest) {
    return {}
  }

  return {
    // Don't log requests etc
    logEvents: false,
    // Don't log anything tagged with DEBUG or info, for example, req.log(['INFO'], 'User is an admin')
    ignoredEventTags: { log: ['DEBUG', 'INFO'], request: ['DEBUG', 'INFO'] }
  }
}

module.exports = {
  go
}
