'use strict'

/**
 * Looks up a user's roles in the `idm` schema and returns the roles and groups assigned to them
 * @module GetUserRolesService
 */

const UserModel = require('../../models/idm/user.model.js')

/**
 * TODO: Document service
 *
 * @param {*} userId
 *
 * @returns
 */
async function go (userId) {
  const user = await UserModel.query().findById(userId)

  // TODO: bail early, maybe with an error, if user is not found

  return {
    userId: user.userId,
    // TODO: get the user's groups
    groups: [],
    // TODO: get the user's roles
    roles: []
  }
}

module.exports = {
  go
}
