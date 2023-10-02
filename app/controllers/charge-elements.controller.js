'use strict'

/**
 * Controller for /charge-elements endpoints
 * @module ChargeElementsController
 */

async function workflowTimeLimitedLicences (request, h) {
  const result = 'Sup'

  return h.response(result).code(201)
}

module.exports = {
  workflowTimeLimitedLicences
}
