'use strict'

/**
 * Config values used by this service, for example, the port to use
 * @module ServerConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  environment: process.env.NODE_ENV || 'development',
  hapi: {
    port: process.env.PORT,
    // The routes section is used to set default configuration for every route in the app. In our case we want to Hapi
    // to set a bunch of common security headers. See https://hapi.dev/api/?v=20.0.0#-routeoptionssecurity for details
    // of what gets enabled.
    routes: {
      security: true
    },
    // The router section controls how incoming request URIs are matched against the routing table. In our AWS
    // environments we see trailing slashes added to the end of paths so this deals with that issue. We also don't want
    // client systems having to worry about what case they use for the endpoint when making a request.
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    }
  },
  // Note - Why lowercase? It's just the convention for http_proxy, https_proxy
  // and no_proxy. ¯\_(ツ)_/¯ https://unix.stackexchange.com/a/212972
  httpProxy: process.env.http_proxy,
  // Default timeout for HTTP requests sent using app/requests/base.request.js
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000
}

module.exports = config
