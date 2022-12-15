'use strict'

const config = {
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000,
  httpProxy: process.env.http_proxy
}

module.exports = config
