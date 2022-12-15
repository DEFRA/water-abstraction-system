'use strict'

const config = {
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000,
  httpProxy: process.env.http_proxy || 'http:localhost:1100'
}

module.exports = config
