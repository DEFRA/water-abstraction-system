'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

async function tearDown (request, h) {
  const result = 'Hi, I am the Tear Down endpoint'

  return h.response(result).code(200)
}

module.exports = {
  tearDown
}
