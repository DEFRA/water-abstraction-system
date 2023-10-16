'use strict'

/**
 * Used by `AuthPlugin` to authenticate and authorise users
 * @module AuthService
 */

const FetchUserRolesAndGroupsService = require('../idm/fetch-user-roles-and-groups.service.js')

/**
 * This service is intended to be used by our `AuthPlugin` to authenticate and authorise users.
 *
 * We take a user id and look it up in the `idm` schema using `FetchUserRolesAndGroupsService`. This gives us a user
 * object along with arrays of role objects and group objects that the user has been assigned to.
 *
 * We return an object that indicates whether the user is valid (based on whether the user exists), along with user
 * information, their roles and their groups. We also return a "scope" array of strings, which correspond to the names
 * of the roles the user has. This is used by hapi when authorising the user against a route; if the route has a scope
 * array of strings then the user's scope array must contain at least one of the strings.
 *
 * @param {Number} userId The user id to be authenticated
 *
 * @returns {Object} response
 * @returns {Boolean} response.isValid Indicates whether the user was found
 * @returns {Object} response.credentials User credentials found in the IDM
 * @returns {UserModel} response.credentials.user Object representing the user
 * @returns {RoleModel[]} response.credentials.roles Objects representing the roles the user has
 * @returns {GroupModel[]} response.credentials.groups Objects representing the groups the user is assigned to
 * @returns {String[]} response.credentials.scope The names of the roles the user has, for route authorisation purposes
 */
async function go (userId) {
  const { user, roles, groups } = await FetchUserRolesAndGroupsService.go(userId)

  // We put each role's name into the scope array for hapi to use for its scope authorisation
  const scope = roles.map((role) => {
    return role.role
  })

  return { isValid: !!user, credentials: { user, roles, groups, scope } }
}

module.exports = {
  go
}
