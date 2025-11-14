'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

const InitiateSessionService = require('../services/return-versions/setup/initiate-session.service.js')
const LicenceSupplementaryProcessBillingFlagService = require('../services/licences/supplementary/process-billing-flag.service.js')
const SubmitMarkForSupplementaryBillingService = require('../services/licences/supplementary/submit-mark-for-supplementary-billing.service.js')
const ViewContactDetailsService = require('../services/licences/view-contact-details.service.js')
const ViewConditionsService = require('../services/licences/view-conditions.service.js')
const ViewLicenceBillsService = require('../services/licences/view-licence-bills.service.js')
const ViewLicenceCommunicationsService = require('../services/licences/view-licence-communications.service.js')
const ViewLicenceContactDetailsService = require('../services/licences/view-licence-contact-details.service.js')
const ViewLicenceContactsService = require('../services/licences/view-licence-contacts.service.js')
const ViewLicenceHistoryService = require('../services/licences/view-licence-history.service.js')
const ViewLicenceReturnsService = require('../services/licences/view-licence-returns.service.js')
const ViewLicenceSetUpService = require('../services/licences/view-licence-set-up.service.js')
const ViewLicenceSummaryService = require('../services/licences/view-licence-summary.service.js')
const ViewMarkForSupplementaryBillingService = require('../services/licences/supplementary/view-mark-for-supplementary-billing.service.js')
const ViewMarkedForSupplementaryBillingService = require('../services/licences/supplementary/view-marked-for-supplementary-billing.service.js')
const ViewPointsService = require('../services/licences/view-points.service.js')
const ViewPurposesService = require('../services/licences/view-purposes.service.js')

const ViewLicencePage = 'licences/view.njk'

async function markedForSupplementaryBilling(request, h) {
  const { id: licenceId } = request.params

  const pageData = await ViewMarkedForSupplementaryBillingService.go(licenceId)

  return h.view('licences/marked-for-supplementary-billing.njk', pageData)
}

async function markForSupplementaryBilling(request, h) {
  const { id: licenceId } = request.params

  const pageData = await ViewMarkForSupplementaryBillingService.go(licenceId)

  return h.view('licences/mark-for-supplementary-billing.njk', pageData)
}

async function noReturnsRequired(request, h) {
  const { id } = request.params

  const session = await InitiateSessionService.go(id, 'no-returns-required')

  return h.redirect(`/system/return-versions/setup/${session.id}/start-date`)
}

async function returnsRequired(request, h) {
  const { id } = request.params

  const session = await InitiateSessionService.go(id, 'returns-required')

  return h.redirect(`/system/return-versions/setup/${session.id}/start-date`)
}

async function submitMarkForSupplementaryBilling(request, h) {
  const { id: licenceId } = request.params

  const pageData = await SubmitMarkForSupplementaryBillingService.go(licenceId, request.payload)

  if (pageData.error) {
    return h.view('licences/mark-for-supplementary-billing.njk', pageData)
  }

  return h.redirect(`/system/licences/${licenceId}/marked-for-supplementary-billing`)
}

async function supplementary(request, h) {
  await LicenceSupplementaryProcessBillingFlagService.go(request.payload)

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function viewBills(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewLicenceBillsService.go(id, auth, page)

  return h.view(ViewLicencePage, pageData)
}

async function viewCommunications(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewLicenceCommunicationsService.go(id, auth, page)

  return h.view(ViewLicencePage, pageData)
}

async function viewLicenceConditions(request, h) {
  const { id } = request.params

  const pageData = await ViewConditionsService.go(id)

  return h.view('licences/conditions.njk', pageData)
}

async function viewLicenceContactDetails(request, h) {
  const { id } = request.params

  const pageData = await ViewContactDetailsService.go(id)

  return h.view('licences/contact-details.njk', pageData)
}

async function viewLicenceContacts(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewLicenceContactsService.go(id, auth)

  return h.view(ViewLicencePage, pageData)
}

async function viewLicencePoints(request, h) {
  const { id: licenceId } = request.params

  const pageData = await ViewPointsService.go(licenceId)

  return h.view('licences/points.njk', pageData)
}

async function viewLicencePurposes(request, h) {
  const { id: licenceId } = request.params

  const pageData = await ViewPurposesService.go(licenceId)

  return h.view('licences/purposes.njk', pageData)
}

async function viewHistory(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewLicenceHistoryService.go(id, auth)

  return h.view('licences/history.njk', pageData)
}

async function viewReturns(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewLicenceReturnsService.go(id, auth, page)

  return h.view(ViewLicencePage, pageData)
}

async function viewSetUp(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewLicenceSetUpService.go(id, auth)

  return h.view(ViewLicencePage, pageData)
}

async function viewSummary(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewLicenceSummaryService.go(id, auth)

  return h.view(ViewLicencePage, pageData)
}

module.exports = {
  markedForSupplementaryBilling,
  markForSupplementaryBilling,
  noReturnsRequired,
  returnsRequired,
  submitMarkForSupplementaryBilling,
  supplementary,
  viewBills,
  viewCommunications,
  viewLicenceContacts,
  viewHistory,
  viewLicenceConditions,
  viewLicenceContactDetails,
  viewLicencePoints,
  viewLicencePurposes,
  viewReturns,
  viewSetUp,
  viewSummary
}
