'use strict'

const config = {
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000,
  httpProxy: process.env.http_proxy,
  httpsProxy: process.env.https_proxy,
  noProxy: process.env.no_proxy
}

module.exports = config
