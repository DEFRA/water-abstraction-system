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
 * @returns {Promise<object>} The view data for the relevant user page
 */
async function go(userId) {
  const { application, id } = await UserModel.query().findOne({ userId }).select(['application', 'id'])

  if (application === 'water_admin') {
    return ViewInternalUserService.go(id)
  }

  return ViewExternalUserService.go(id)
}

module.exports = {
  go
}
