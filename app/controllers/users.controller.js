/**
 * Controller for /users endpoints
 * @module UsersController
 */

import FetchLegacyIdDal from '../dal/users/fetch-legacy-id.dal.js'
import IndexUsersService from '../services/users/index-users.service.js'
import SubmitIndexUsersService from '../services/users/submit-index-users.service.js'
import SubmitProfileDetailsService from '../services/users/submit-profile-details.service.js'
import ViewExternalCommunicationsService from '../services/users/external/view-communications.service.js'
import ViewExternalDetailsService from '../services/users/external/view-details.service.js'
import ViewExternalLicencesService from '../services/users/external/view-licences.service.js'
import ViewExternalVerificationsService from '../services/users/external/view-verifications.service.js'
import ViewInternalCommunicationsService from '../services/users/internal/view-communications.service.js'
import ViewInternalDetailsService from '../services/users/internal/view-details.service.js'
import ViewNotificationService from '../services/users/view-notification.service.js'
import ViewProfileDetailsService from '../services/users/view-profile-details.service.js'

import FeatureFlagsConfig from '../../config/feature-flags.config.js'

export async function index(request, h) {
  const {
    auth,
    query: { page },
    yar
  } = request

  const pageData = await IndexUsersService(yar, auth, page)

  return h.view('users/index.njk', pageData)
}

export async function submitIndex(request, h) {
  const {
    auth,
    payload,
    query: { page },
    yar
  } = request

  const pageData = await SubmitIndexUsersService(payload, yar, auth, page)

  if (pageData.error) {
    return h.view('users/index.njk', pageData)
  }

  return h.redirect('/system/users')
}

export async function submitInternalDetails(request, h) {
  const { id } = request.params

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  return h.redirect(`/system/users/internal/setup/${id}/edit`)
}

export async function submitProfileDetails(request, h) {
  const { payload, yar } = request
  const { userId } = request.auth.credentials.user

  const pageData = await SubmitProfileDetailsService(userId, payload, yar)

  if (pageData.error) {
    return h.view('users/profile-details.njk', pageData)
  }

  return h.redirect('/system/users/me/profile-details')
}

export async function viewExternalCommunications(request, h) {
  const {
    auth,
    params: { id },
    query: { back, page }
  } = request

  const pageData = await ViewExternalCommunicationsService(id, auth, page, back)

  return h.view('users/external/communications.njk', pageData)
}

export async function viewExternalDetails(request, h) {
  const {
    auth,
    params: { id },
    query: { back }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewExternalDetailsService(id, auth, back)

  return h.view('users/external/details.njk', pageData)
}

export async function viewExternalLicences(request, h) {
  const {
    auth,
    params: { id },
    query: { back, page },
    yar
  } = request

  const pageData = await ViewExternalLicencesService(id, auth, page, yar, back)

  return h.view('users/external/licences.njk', pageData)
}

export async function viewExternalVerifications(request, h) {
  const {
    auth,
    params: { id },
    query: { back, page }
  } = request

  const pageData = await ViewExternalVerificationsService(id, auth, page, back)

  return h.view('users/external/verifications.njk', pageData)
}

export async function viewInternalCommunications(request, h) {
  const {
    params: { id },
    query: { page }
  } = request

  const pageData = await ViewInternalCommunicationsService(id, page)

  return h.view('users/internal/communications.njk', pageData)
}

export async function viewInternalDetails(request, h) {
  const {
    auth,
    params: { id }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewInternalDetailsService(auth, id)

  return h.view('users/internal/details.njk', pageData)
}

export async function viewNotification(request, h) {
  const {
    auth,
    params: { type, id, notificationId }
  } = request

  const pageData = await ViewNotificationService(notificationId, id, type, auth)

  return h.view('users/notification.njk', pageData)
}

export async function viewProfileDetails(request, h) {
  const { userId } = request.auth.credentials.user

  const pageData = await ViewProfileDetailsService(userId, request.yar)

  return h.view('users/profile-details.njk', pageData)
}

async function _redirectToLegacy(id, h) {
  const userId = await FetchLegacyIdDal(id)

  return h.redirect(`/user/${userId}/status`)
}
