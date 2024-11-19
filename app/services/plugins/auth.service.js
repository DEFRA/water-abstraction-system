'use strict'

/**
 * Used by `AuthPlugin` to authenticate and authorise users
 * @module AuthService
 */

const FetchUserRolesAndGroupsService = require('../idm/fetch-user-roles-and-groups.service.js')

/**
 * Used by `AuthPlugin` to authenticate and authorise users
 *
 * We take a user id and look it up in the `idm` schema using `FetchUserRolesAndGroupsService`. This gives us a user
 * object along with arrays of role objects and group objects that the user has been assigned to.
 *
 * We return an object that indicates whether the user is valid (based on whether the user exists), along with user
 * information, their roles and their groups. We also return a "scope" array of strings, which correspond to the names
 * of the roles the user has. This is used by hapi when authorising the user against a route; if the route has a scope
 * array of strings then the user's scope array must contain at least one of the strings.
 *
 * Finally, we return a 'permission' object. This is used to determine which nav bar menu items a user sees.
 *
 * ```javascript
 * {
 *   // whether the user was found
 *   isValid: true,
 *   credentials: {
 *     // Object representing the user
 *     user: { name: 'User' },
 *     // Groups the user is assigned to
 *     groups: [{ group: 'Group' }],
 *     // Roles the user has
 *     roles: [{ role: 'Role' }],
 *     // The names of the roles the user has, for route authorisation purposes
 *     scope: ['billing', 'charge_version_workflow_editor'],
 *     // Object with each top level permission as a key and true or false whether the user has authorisation to access
 *     // the area
 *     permission: { abstractionReform: false, billRuns: true, manage: true }
 *   }
 * }
 * ```
 *
 * @param {number} userId - The user id to be authenticated
 *
 * @returns {object} the permission object
 */
async function go (userId) {
  const { user, roles, groups } = await FetchUserRolesAndGroupsService.go(userId)

  // We put each role's name into the scope array for hapi to use for its scope authorisation
  const scope = roles.map((role) => {
    return role.role
  })

  const permission = _permission(scope)

  return { isValid: !!user, credentials: { user, roles, groups, scope, permission } }
}

/**
 * Determine top level permissions
 *
 * The legacy service uses 'roles' to determine what a user can or cannot do. These roles are added to routes as 'scope'
 * and used to determine if a users is authorized to access a particular page.
 *
 * These 'roles' are very granular, for example, in the Manage page what links you see is dependent on the roles you
 * have. Because of the current way the UI is designed we need to know whether you can access one of the top level areas
 * of the site; Bill runs, Digitise! and Manage.
 *
 * For simplicity we call these 'permissions'. We determine them in this function and add them to the credentials this
 * service returns.
 *
 * They are used by the nav bar to determine which menu items should be visible.
 *
 * @param {string[]} scope - All the scopes (roles) a user has access to
 *
 * @returns {object} Each top level permissions is a key. The value is true or false as to whether the user has
 * permission to access that area of the service
 *
 * @private
 */
function _permission (scope = []) {
  const billRuns = scope.includes('billing')

  const manageRoles = [
    'ar_approver',
    'billing',
    'bulk_return_notifications',
    'hof_notifications',
    'manage_accounts',
    'renewal_notifications',
    'returns'
  ]
  const manage = scope.some((role) => {
    return manageRoles.includes(role)
  })

  const abstractionReformRoles = [
    'ar_user',
    'ar_approver'
  ]
  const abstractionReform = scope.some((role) => {
    return abstractionReformRoles.includes(role)
  })

  return {
    abstractionReform,
    billRuns,
    manage
  }
}

module.exports = {
  go
}
