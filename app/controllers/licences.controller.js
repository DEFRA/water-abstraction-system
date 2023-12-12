'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

async function noReturnsRequired (request, h) {
  const { id } = request.params

  return h.view('return-requirements/no-returns-required.njk', {
    activeNavBar: 'search',
    licenceId: id
  })
}

async function selectReturnStartDate (request, h) {
  const { id } = request.params

  return h.view('return-requirements/select-return-start-date.njk', {
    activeNavBar: 'search',
    licenceId: id
  })
}

async function requirementsApproved (request, h) {
  const { id } = request.params

  return h.view('return-requirements/requirements-approved.njk', {
    activeNavBar: 'search',
    licenceId: id
  })
}

module.exports = {
  noReturnsRequired,
  requirementsApproved,
  selectReturnStartDate
}
