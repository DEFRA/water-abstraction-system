'use strict'

/**
 * Controller for /contact-name endpoint
 * @module ContactNameController
 */

async function view (_request, h) {
  return h.view('user-details/contact-name.njk', {
    pageTitle: 'Contact Name'
  }
  )
}

async function saveInput (request, h) {
  const { firstName, lastName } = request.payload
  return h.response(`Form data received and processed successfully - FirstName: ${firstName}, LastName: ${lastName}`).code(200)
}

module.exports = {
  view,
  saveInput
}
