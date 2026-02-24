'use strict'

/**
 * Controller for /users endpoints
 * @module UsersController
 */

const Boom = require('@hapi/boom')

const FetchLegacyIdService = require('../services/users/fetch-legacy-id.service.js')
const IndexUsersService = require('../services/users/index-users.service.js')
const SubmitEditUserInternalService = require('../services/users/internal/submit-edit-user.service.js')
const SubmitIndexUsersService = require('../services/users/submit-index-users.service.js')
const SubmitProfileDetailsService = require('../services/users/submit-profile-details.service.js')
const ViewEditUserInternalService = require('../services/users/internal/view-edit-user.service.js')
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

async function submitEditUserInternal(request, h) {
  const {
    auth,
    params: { id },
    payload
  } = request

  const pageData = await SubmitEditUserInternalService.go(id, payload, auth)

  if (Boom.isBoom(pageData)) {
    return pageData
  }

  if (pageData.error) {
    return h.view(`users/internal/edit-user.njk`, pageData)
  }

  return h.redirect(`/system/users/internal/${id}`)
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

async function submitViewUserExternal(request, h) {
  const { id } = request.params

  return _redirectToLegacy(id, h)
}

async function submitViewUserInternal(request, h) {
  const { id } = request.params

  return h.redirect(`/system/users/internal/${id}/edit`)
}

async function viewEditUserInternal(request, h) {
  const {
    auth,
    params: { id }
  } = request

  const pageData = await ViewEditUserInternalService.go(id, auth)

  if (Boom.isBoom(pageData)) {
    return pageData
  }

  return h.view(`users/internal/edit-user.njk`, pageData)
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
    auth,
    params: { id }
  } = request

  if (!FeatureFlagsConfig.enableUsersManagement) {
    return _redirectToLegacy(id, h)
  }

  const pageData = await ViewUserInternalService.go(id, auth)

  return h.view('users/internal/view-user.njk', pageData)
}

async function _redirectToLegacy(id, h) {
  const userId = await FetchLegacyIdService.go(id)

  return h.redirect(`/user/${userId}/status`)
}

module.exports = {
  index,
  submitEditUserInternal,
  submitIndex,
  submitProfileDetails,
  submitViewUserExternal,
  submitViewUserInternal,
  viewEditUserInternal,
  viewProfileDetails,
  viewUserExternal,
  viewUserInternal
}
