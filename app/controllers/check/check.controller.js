'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

async function twoPart (_request, h) {
  return h.response().code(204)
}

module.exports = {
  twoPart
}
