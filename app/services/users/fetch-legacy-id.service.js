'use strict'

/**
 * Fetches the legacy `userId` value for a user, needed to link to the legacy user management pages
 * @module FetchLegacyIdService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches the legacy `userId` value for a user, needed to link to the legacy user management pages
 *
 * The previous team setup the `idm.users` table with a unique identifier that was an incrementing integer named
 * `user_id` as is their convention. Really, this should be a UUID to protect against Insecure Direct Object References
 * (IDOR) vulnerabilities.
 *
 * So, we added a `id` field to the table, and intend to use that for all work we do in **system**. Until we have
 * migrated _all_ user functionality though, there are times we still need to access it.
 *
 * This service is intended to fetch the legacy ID for those times when only the new UUID has been provided.
 *
 * If all is well this service should be gone before anyone new to the team has to read this note!
 *
 * @param {number} id - The (legacy) numeric ID of the requested user, equating to the `user_id` field in the
 * database
 *
 * @returns {Promise<number>} the requested user's legacy `userId`
 */
async function go(id) {
  const { userId } = await UserModel.query().select(['userId']).findById(id)

  return userId
}

module.exports = {
  go
}
