'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const CheckSupplementaryBillingFlagService = require('../services/licences/check-supplementary-billing-flag.service.js')
const InitiateSessionService = require('../services/return-requirements/initiate-session.service.js')
const ViewLicenceBillsService = require('../services/licences/view-licence-bills.service.js')
const ViewLicenceCommunicationsService = require('../services/licences/view-licence-communications.service.js')
const ViewLicenceContactDetailsService = require('../services/licences/view-licence-contact-details.service.js')
const ViewLicenceReturnsService = require('../services/licences/view-licence-returns.service.js')
const ViewLicenceSetUpService = require('../services/licences/view-licence-set-up.service.js')
const ViewLicenceSummaryService = require('../services/licences/view-licence-summary.service.js')

const ViewLicencePage = 'licences/view.njk'

async function noReturnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateSessionService.go(id, 'no-returns-required')

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

async function returnsRequired (request, h) {
  const { id } = request.params

  const session = await InitiateSessionService.go(id, 'returns-required')

  return h.redirect(`/system/return-requirements/${session.id}/start-date`)
}

async function viewBills (request, h) {
  const { params: { id }, auth, query: { page = 1 } } = request

  const data = await ViewLicenceBillsService.go(id, auth, page)

  return h.view(ViewLicencePage, {
    ...data
  })
}

async function viewSetUp (request, h) {
  const { params: { id }, auth } = request

  const data = await ViewLicenceSetUpService.go(id, auth)

  return h.view(ViewLicencePage, {
    ...data
  })
}

async function viewCommunications (request, h) {
  const { params: { id }, auth, query: { page = 1 } } = request

  const data = await ViewLicenceCommunicationsService.go(id, auth, page)

  return h.view(ViewLicencePage, {
    ...data
  })
}

async function viewContacts (request, h) {
  const { params: { id }, auth } = request

  const data = await ViewLicenceContactDetailsService.go(id, auth)

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

async function submitSupplementaryFlag (request, h) {
  await CheckSupplementaryBillingFlagService.go(request.payload)

  return h.response().code(204)
}

module.exports = {
  noReturnsRequired,
  returnsRequired,
  submitSupplementaryFlag,
  viewBills,
  viewCommunications,
  viewContacts,
  viewReturns,
  viewSetUp,
  viewSummary
}
