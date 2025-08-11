'use strict'

/**
 * Controller for /users endpoints
 * @module UsersController
 */

const SubmitProfileDetailsService = require('../services/users/submit-profile-details.service.js')
const ViewProfileDetailsService = require('../services/users/view-profile-details.service.js')

async function submitProfileDetails(request, h) {
  const { payload, yar } = request
  const { id: userId } = request.auth.credentials.user

  const pageData = await SubmitProfileDetailsService.go(userId, payload, yar)

  if (pageData.error) {
    return h.view('users/profile-details.njk', pageData)
  }

  return h.redirect('/system/users/me/profile-details')
}

async function viewProfileDetails(request, h) {
  const { id: userId } = request.auth.credentials.user

  const pageData = await ViewProfileDetailsService.go(userId, request.yar)

  return h.view('users/profile-details.njk', pageData)
}

module.exports = {
  submitProfileDetails,
  viewProfileDetails
}
