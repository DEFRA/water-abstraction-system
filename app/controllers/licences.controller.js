'use strict'

/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

const InitiateSessionService = require('../services/return-versions/setup/initiate-session.service.js')
const LicenceSupplementaryProcessBillingFlagService = require('../services/licences/supplementary/process-billing-flag.service.js')
const SubmitMarkForSupplementaryBillingService = require('../services/licences/supplementary/submit-mark-for-supplementary-billing.service.js')
const ViewBillsService = require('../services/licences/view-bills.service.js')
const ViewCommunicationsService = require('../services/licences/view-communications.service.js')
const ViewConditionsService = require('../services/licences/view-conditions.service.js')
const ViewContactsService = require('../services/licences/view-contacts.service.js')
const ViewLicenceContactService = require('../services/licences/view-licence-contacts.service.js')
const ViewLicenceHistoryService = require('../services/licences/view-licence-history.service.js')
const ViewMarkForSupplementaryBillingService = require('../services/licences/supplementary/view-mark-for-supplementary-billing.service.js')
const ViewMarkedForSupplementaryBillingService = require('../services/licences/supplementary/view-marked-for-supplementary-billing.service.js')
const ViewPointsService = require('../services/licences/view-points.service.js')
const ViewPurposesService = require('../services/licences/view-purposes.service.js')
const ViewReturnsService = require('../services/licences/view-returns.service.js')
const ViewSetUpService = require('../services/licences/view-set-up.service.js')
const ViewSummaryService = require('../services/licences/view-summary.service.js')

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

  const pageData = await ViewBillsService.go(id, auth, page)

  return h.view('licences/bills.njk', pageData)
}

async function viewCommunications(request, h) {
  const {
    params: { id },
    auth,
    query: { page = 1 }
  } = request

  const pageData = await ViewCommunicationsService.go(id, auth, page)

  return h.view('licences/communications.njk', pageData)
}

async function viewLicenceConditions(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewConditionsService.go(id, auth)

  return h.view('licences/conditions.njk', pageData)
}

async function viewLicenceContactDetails(request, h) {
  const { id } = request.params

  const pageData = await ViewLicenceContactService.go(id)

  return h.view('licences/licence-contact-details.njk', pageData)
}

async function viewLicenceContacts(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewContactsService.go(id, auth)

  return h.view('licences/contact-details.njk', pageData)
}

async function viewLicencePoints(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewPointsService.go(id, auth)

  return h.view('licences/points.njk', pageData)
}

async function viewLicencePurposes(request, h) {
  const {
    params: { id },
    auth
  } = request
  const pageData = await ViewPurposesService.go(id, auth)

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

  const pageData = await ViewReturnsService.go(id, auth, page)

  return h.view('licences/returns.njk', pageData)
}

async function viewSetUp(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewSetUpService.go(id, auth)

  return h.view('licences/set-up.njk', pageData)
}

async function viewSummary(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewSummaryService.go(id, auth)

  return h.view('licences/summary.njk', pageData)
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
