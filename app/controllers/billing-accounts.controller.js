'use strict'

/**
 * Controller for /billing-accounts endpoints
 * @module BillingAccountsController
 */

const Boom = require('@hapi/boom')

const ChangeAddressValidator = require('../validators/change-address.validator.js')

async function changeAddress (request, h) {
  const validatedData = ChangeAddressValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  return h.response().code(201)
}

/**
 * Takes an error from a validator and returns a suitable Boom error
*/
function _formattedValidationError (error) {
  return Boom.badRequest(error.details[0].message)
}

module.exports = {
  changeAddress
}
