'use strict'

const config = {
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000,
  // Note - Why lowercase? It's just the convention for http_proxy, https_proxy
  // and no_proxy. ¯\_(ツ)_/¯ https://unix.stackexchange.com/a/212972
  httpProxy: process.env.http_proxy
}

module.exports = config
