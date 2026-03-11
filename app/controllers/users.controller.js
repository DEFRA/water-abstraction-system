'use strict'

/**
 * Controller for /users endpoints
 * @module UsersController
 */

const FetchLegacyUserIdService = require('../services/users/fetch-legacy-user-id.service.js')
const IndexUsersService = require('../services/users/index-users.service.js')
const SubmitIndexUsersService = require('../services/users/submit-index-users.service.js')
const SubmitProfileDetailsService = require('../services/users/submit-profile-details.service.js')
const ViewProfileDetailsService = require('../services/users/view-profile-details.service.js')
const ViewExternalUserService = require('../services/users/view-external-user.service.js')
const ViewInternalUserService = require('../services/users/view-internal-user.service.js')

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

async function submitViewExternalUser(request, h) {
  const { userId: id } = request.params

  const { userId } = await FetchLegacyUserIdService.go(id)

  return h.redirect(`/user/${userId}/status`)
}

async function submitViewInternalUser(request, h) {
  const { userId: id } = request.params

  const { userId } = await FetchLegacyUserIdService.go(id)

  return h.redirect(`/user/${userId}/status`)
}

async function viewProfileDetails(request, h) {
  const { userId } = request.auth.credentials.user

  const pageData = await ViewProfileDetailsService.go(userId, request.yar)

  return h.view('users/profile-details.njk', pageData)
}

async function viewExternalUser(request, h) {
  const { userId } = request.params

  const pageData = await ViewExternalUserService.go(userId, request.auth)

  return h.view('users/view-external.njk', pageData)
}

async function viewInternalUser(request, h) {
  const { userId } = request.params

  const pageData = await ViewInternalUserService.go(userId)

  return h.view('users/view-internal.njk', pageData)
}

module.exports = {
  index,
  submitIndex,
  submitProfileDetails,
  submitViewExternalUser,
  submitViewInternalUser,
  viewExternalUser,
  viewInternalUser,
  viewProfileDetails
}
