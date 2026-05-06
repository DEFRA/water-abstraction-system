'use strict'

/**
 * Controller for /users endpoints
 * @module UsersController
 */

const FetchLegacyIdDal = require('../dal/users/fetch-legacy-id.dal.js')
const IndexUsersService = require('../services/users/index-users.service.js')
const SubmitIndexUsersService = require('../services/users/submit-index-users.service.js')
const SubmitProfileDetailsService = require('../services/users/submit-profile-details.service.js')
const ViewExternalDetailsService = require('../services/users/external/view-details.service.js')
const ViewExternalLicencesService = require('../services/users/external/view-licences.service.js')
const ViewExternalVerificationsService = require('../services/users/external/view-verifications.service.js')
const ViewInternalCommunicationsService = require('../services/users/internal/view-communications.service.js')
const ViewInternalDetailsService = require('../services/users/internal/view-details.service.js')
const ViewNotificationService = require('../services/users/view-notification.service.js')
const ViewProfileDetailsService = require('../services/users/view-profile-details.service.js')

const FeatureFlagsConfig = require('../../config/feature-flags.config.js')

async function index(request, h) {
  const {
    auth,
    query: { page },
    yar
  } = request

  const pageData = await IndexUsersService.go(yar, auth, page)

  return h.view('users/index.njk', pageData)
}

async function submitExternalDetails(request, h) {
  const { id } = request.params

  return _redirectToLegacy(id, h)
}

async function submitIndex(request, h) {
  const {
    auth,
    payload,
    query: { page },
    yar
  } = request

  const pageData = await SubmitIndexUsersService.go(payload, yar, auth, page)

  if (pageData.error) {
    return h.view('users/index.njk', pageData)
  }

  return h.redirect('/system/users')
}

async function submitInternalDetails(request, h) {
  const { id } = request.params

  return _redirectToLegacy(id, h)
}

async function submitProfileDetails(request, h) {
  const { payload, yar } = request
  const { userId } = request.auth.credentials.user

  const pageData = await SubmitProfileDetailsService.go(userId, payload, yar)

  if (pageData.error) {
    return h.view('users/profile-details.njk', pageData)
  }

  return h.redirect('/system/users/me/profile-details')
}

async function viewExternalDetails(request, h) {
  const {
    auth,
    params: { id },
    query: { back }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewExternalDetailsService.go(id, auth, back)

  return h.view('users/external/details.njk', pageData)
}

async function viewExternalLicences(request, h) {
  const {
    auth,
    params: { id },
    query: { back, page }
  } = request

  const pageData = await ViewExternalLicencesService.go(id, auth, page, back)

  return h.view('users/external/licences.njk', pageData)
}

async function viewExternalVerifications(request, h) {
  const {
    auth,
    params: { id },
    query: { back, page }
  } = request

  const pageData = await ViewExternalVerificationsService.go(id, auth, page, back)

  return h.view('users/external/verifications.njk', pageData)
}

async function viewInternalCommunications(request, h) {
  const {
    params: { id },
    query: { page }
  } = request

  const pageData = await ViewInternalCommunicationsService.go(id, page)

  return h.view('users/internal/communications.njk', pageData)
}

async function viewInternalDetails(request, h) {
  const {
    params: { id }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewInternalDetailsService.go(id)

  return h.view('users/internal/details.njk', pageData)
}

async function viewNotification(request, h) {
  const {
    auth,
    params: { type, id, notificationId }
  } = request

  const pageData = await ViewNotificationService.go(notificationId, id, type, auth)

  return h.view('users/notification.njk', pageData)
}

async function viewProfileDetails(request, h) {
  const { userId } = request.auth.credentials.user

  const pageData = await ViewProfileDetailsService.go(userId, request.yar)

  return h.view('users/profile-details.njk', pageData)
}

async function _redirectToLegacy(id, h) {
  const userId = await FetchLegacyIdDal.go(id)

  return h.redirect(`/user/${userId}/status`)
}

module.exports = {
  index,
  submitExternalDetails,
  submitIndex,
  submitProfileDetails,
  submitInternalDetails,
  viewExternalDetails,
  viewExternalLicences,
  viewExternalVerifications,
  viewNotification,
  viewProfileDetails,
  viewInternalCommunications,
  viewInternalDetails
}
