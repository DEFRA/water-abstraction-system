/**
 * Controller for /licences endpoints
 * @module LicencesController
 */

import http2 from 'node:http2'
import InitiateSessionService from '../services/return-versions/setup/initiate-session.service.js'
import LicenceSupplementaryProcessBillingFlagService from '../services/licences/supplementary/process-billing-flag.service.js'
import SubmitMarkForSupplementaryBillingService from '../services/licences/supplementary/submit-mark-for-supplementary-billing.service.js'
import ViewBillsService from '../services/licences/view-bills.service.js'
import ViewCommunicationsService from '../services/licences/view-communications.service.js'
import ViewConditionsService from '../services/licences/view-conditions.service.js'
import ViewContactDetailsService from '../services/licences/view-contact-details.service.js'
import ViewHistoryService from '../services/licences/view-history.service.js'
import ViewMarkForSupplementaryBillingService from '../services/licences/supplementary/view-mark-for-supplementary-billing.service.js'
import ViewMarkedForSupplementaryBillingService from '../services/licences/supplementary/view-marked-for-supplementary-billing.service.js'
import ViewPointsService from '../services/licences/view-points.service.js'
import ViewPurposesService from '../services/licences/view-purposes.service.js'
import ViewReturnsService from '../services/licences/view-returns.service.js'
import ViewSetUpService from '../services/licences/view-set-up.service.js'
import ViewSummaryService from '../services/licences/view-summary.service.js'

const { HTTP_STATUS_NO_CONTENT } = http2.constants

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
    query: { page }
  } = request

  const pageData = await ViewBillsService.go(id, auth, page)

  return h.view('licences/bills.njk', pageData)
}

async function viewCommunications(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
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

async function viewContactDetails(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
  } = request

  const pageData = await ViewContactDetailsService.go(id, auth, page)

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

  const pageData = await ViewHistoryService.go(id, auth)

  return h.view('licences/history.njk', pageData)
}

async function viewReturns(request, h) {
  const {
    params: { id },
    auth,
    query: { page }
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

export default {
  markedForSupplementaryBilling,
  markForSupplementaryBilling,
  noReturnsRequired,
  returnsRequired,
  submitMarkForSupplementaryBilling,
  supplementary,
  viewBills,
  viewCommunications,
  viewContactDetails,
  viewHistory,
  viewLicenceConditions,
  viewLicencePoints,
  viewLicencePurposes,
  viewReturns,
  viewSetUp,
  viewSummary
}
