'use strict'

/**
 * Controller for /users endpoints
 * @module UsersController
 */

const FetchLegacyIdService = require('../services/users/fetch-legacy-id.service.js')
const IndexUsersService = require('../services/users/index-users.service.js')
const SubmitIndexUsersService = require('../services/users/submit-index-users.service.js')
const SubmitProfileDetailsService = require('../services/users/submit-profile-details.service.js')
const ViewProfileDetailsService = require('../services/users/view-profile-details.service.js')
const ViewUserExternalService = require('../services/users/external/view-user.service.js')
const ViewUserInternalService = require('../services/users/internal/view-user.service.js')

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

async function submitProfileDetails(request, h) {
  const { payload, yar } = request
  const { userId } = request.auth.credentials.user

  const pageData = await SubmitProfileDetailsService.go(userId, payload, yar)

  if (pageData.error) {
    return h.view('users/profile-details.njk', pageData)
  }

  return h.redirect('/system/users/me/profile-details')
}

async function submitUserExternal(request, h) {
  const { id } = request.params

  return _redirectToLegacy(id, h)
}

async function submitUserInternal(request, h) {
  const { id } = request.params

  return _redirectToLegacy(id, h)
}

async function viewProfileDetails(request, h) {
  const { userId } = request.auth.credentials.user

  const pageData = await ViewProfileDetailsService.go(userId, request.yar)

  return h.view('users/profile-details.njk', pageData)
}

async function viewUserExternal(request, h) {
  const {
    auth,
    params: { id },
    query: { back }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewUserExternalService.go(id, auth, back)

  return h.view('users/external/view-user.njk', pageData)
}

async function viewUserInternal(request, h) {
  const {
    params: { id }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewUserInternalService.go(id)

  return h.view('users/internal/view-user.njk', pageData)
}

async function _redirectToLegacy(id, h) {
  const userId = await FetchLegacyIdService.go(id)

  return h.redirect(`/user/${userId}/status`)
}

module.exports = {
  index,
  submitIndex,
  submitProfileDetails,
  submitUserExternal,
  submitUserInternal,
  viewProfileDetails,
  viewUserExternal,
  viewUserInternal
}
