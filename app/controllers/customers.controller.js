'use strict'

/**
 * Controller for /customers endpoints
 * @module CustomersController
 */

const ContactService = require('../services/customers/contacts.service.js')

async function viewContact(request, h) {
  const { id } = request.params

  const pageData = await ContactService.go(id)

  return h.view(`customers/contact.njk`, pageData)
}

module.exports = {
  viewContact
}
