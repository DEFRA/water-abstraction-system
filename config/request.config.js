'use strict'

const config = {
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000
}

module.exports = config
