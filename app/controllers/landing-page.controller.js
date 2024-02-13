'use strict'

/**
 * Controller for /landing-page endpoint
 * @module LandingPageController
 */

async function view (request, h) {
  return h.view('landing-page.njk', {
    pageTitle: 'Landing page'
  }
  )
}

module.exports = {
  view
}
