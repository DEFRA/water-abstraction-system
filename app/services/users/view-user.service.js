'use strict'

/**
 * Orchestrates fetching and presenting the data for `/users/{userId}` page
 * @module ViewUserService
 */

const FetchUserTypeService = require('./fetch-user-type.service.js')
const ViewExternalUserService = require('./view-external-user.service.js')
const ViewInternalUserService = require('./view-internal-user.service.js')

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
  const user = await FetchUserTypeService.go(userId)

  if (user.$internal()) {
    return ViewInternalUserService.go(user.id)
  }

  return ViewExternalUserService.go(user.id)
}

module.exports = {
  go
}
