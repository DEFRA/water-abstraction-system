'use strict'

/**
 * Config values used by app/lib/request.lib.js
 * @module RequestConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000,
  // Generating a bill run can require us to fire 1000's of requests at the charging module in a burst. Obviously, this
  // can put the API under pressure so requests can take longer to complete. To avoid a slow request causing the whole
  // bill run to error we give the CHA a little more wiggle-room to handle things
  chargingModuleTimeout: parseInt(process.env.CHA_REQUEST_TIMEOUT) || 20000,
  // Note - Why lowercase? It's just the convention for http_proxy, https_proxy
  // and no_proxy. ¯\_(ツ)_/¯ https://unix.stackexchange.com/a/212972
  httpProxy: process.env.http_proxy,
  htmlToPdfTimeout: parseInt(process.env.HTML_TO_PDF_TIMEOUT) || 20000
}

module.exports = config
