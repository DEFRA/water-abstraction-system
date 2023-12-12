'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

async function noReturnsRequired (_request, h) {
  return h.response().code(200)
}

async function selectReturnStartDate (request, h) {
  const { id } = request.params

  return h.view('return-requirements/select-return-start-date.njk', {
    activeNavBar: 'search',
    licenceId: id
  })
}

module.exports = {
  noReturnsRequired,
  selectReturnStartDate
}
