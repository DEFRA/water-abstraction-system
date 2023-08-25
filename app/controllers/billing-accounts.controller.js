'use strict'

/**
 * Controller for /billing-accounts endpoints
 * @module BillingAccountsController
 */

async function changeAddress (_request, h) {
  return h.response().code(201)
}

module.exports = {
  changeAddress
}
