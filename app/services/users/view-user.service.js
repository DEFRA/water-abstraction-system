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
 * @returns {Promise<object>} The view data for the relevant user page and a flag to indicate whether the user is
 * internal or external
 */
async function go(userId) {
  const user = await FetchUserTypeService.go(userId)
  const internal = user.$internal()

  const pageData = internal ? await ViewInternalUserService.go(user.id) : await ViewExternalUserService.go(user.id)

  return {
    pageData,
    userIsInternal: internal
  }
}

module.exports = {
  go
}
