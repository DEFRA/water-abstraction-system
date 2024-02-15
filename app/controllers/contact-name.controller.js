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

module.exports = {
  view
}
