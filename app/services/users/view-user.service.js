'use strict'

/**
 * Orchestrates fetching and presenting the data for `/users/{userId}` page
 * @module ViewUserService
 */

const ViewExternalUserService = require('./view-external-user.service.js')
const ViewInternalUserService = require('./view-internal-user.service.js')
const UserModel = require('../../models/user.model.js')

/**
 * Orchestrates fetching and presenting the data for `/users/{userId}` page
 *
 * This page may display either an external or internal user, so delegates the processing to the relevant service based
 * on the user type.
 *
 * @param {number} userId - The user's ID
 *
 * @returns {Promise<object>} The view data for the profile details page
 */
async function go(userId) {
  const userApplication = await _userApplication(userId)

  if (userApplication === 'water_admin') {
    return ViewInternalUserService.go(userId)
  }

  return ViewExternalUserService.go(userId)
}

async function _userApplication(userId) {
  const user = await UserModel.query().findById(userId).select(['application'])

  return user.application
}

module.exports = {
  go
}
