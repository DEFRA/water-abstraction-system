'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const InitiateReturnRequirementSessionService = require('../services/return-requirements/initiate-return-requirement-session.service.js')
const ViewLicenceBillsService = require('../services/licences/view-licence-bills.service')
const ViewLicenceReturnsService = require('../services/licences/view-licence-returns.service')
const ViewLicenceSummaryService = require('../services/licences/view-licence-summary.service')


const ViewLicencePage = 'licences/view.njk'

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateReturnRequirementSessionService.go(id, 'no-returns-required')

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

async function returnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateReturnRequirementSessionService.go(id, 'returns-required')

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

async function viewBills (request, h) {
  const { params: { id }, auth, query: { page = 1 } } = request

  const data = await ViewLicenceBillsService.go(id, auth, page)

  return h.view(ViewLicencePage, {
    ...data
  })
}

async function viewSummary (request, h) {
  const { params: { id }, auth } = request

  const data = await ViewLicenceSummaryService.go(id, auth)

  return h.view(ViewLicencePage, {
    ...data
  })
}

async function viewReturns (request, h) {
  const { params: { id }, auth, query: { page = 1 } } = request

  const data = await ViewLicenceReturnsService.go(id, auth, page)

  return h.view(ViewLicencePage, {
    ...data
  })
}

module.exports = {
  noReturnsRequired,
  returnsRequired,
  viewBills,
  viewReturns,
  viewSummary
}
