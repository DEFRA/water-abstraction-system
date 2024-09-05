'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const LicenceSupplementaryProcessBillingFlagService = require('../services/licences/supplementary/process-billing-flag.service.js')
const InitiateSessionService = require('../services/return-requirements/initiate-session.service.js')
const ViewLicenceBillsService = require('../services/licences/view-licence-bills.service.js')
const ViewLicenceCommunicationsService = require('../services/licences/view-licence-communications.service.js')
const ViewLicenceContactService = require('../services/licences/view-licence-contact.service.js')
const ViewLicenceContactDetailsService = require('../services/licences/view-licence-contact-details.service.js')
const ViewLicenceHistoryService = require('../services/licences/view-licence-history.service.js')
const ViewLicenceReturnsService = require('../services/licences/view-licence-returns.service.js')
const ViewLicenceSetUpService = require('../services/licences/view-licence-set-up.service.js')
const ViewLicenceSummaryService = require('../services/licences/view-licence-summary.service.js')

const ViewLicencePage = 'licences/view.njk'
const ViewLicenceContactPage = 'licences/licence-contact.njk'

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

async function viewLicenceContact (request, h) {
  const { id } = request.params

  const data = await ViewLicenceContactService.go(id)

  return h.view(ViewLicenceContactPage, {
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

async function viewHistory (request, h) {
  const { params: { id }, auth } = request

  const data = await ViewLicenceHistoryService.go(id, auth)

  return h.view('licences/history.njk', {
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

async function supplementary (request, h) {
  LicenceSupplementaryProcessBillingFlagService.go(request.payload)

  return h.response().code(204)
}

module.exports = {
  noReturnsRequired,
  returnsRequired,
  supplementary,
  viewBills,
  viewCommunications,
  viewContacts,
  viewHistory,
  viewLicenceContact,
  viewReturns,
  viewSetUp,
  viewSummary
}
