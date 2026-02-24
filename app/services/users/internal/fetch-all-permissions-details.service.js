'use strict'

/**
 * Fetches all the possible permissions for a user for display on the /users/internal/{id}/edit page
 * @module FetchAllPermissionsDetailsService
 */

const GroupModel = require('../../../models/group.model.js')
const RoleModel = require('../../../models/role.model.js')

const { userPermissions } = require('../../../lib/static-lookups.lib.js')

/**
 * Fetches all the possible permissions for a user for display on the /users/internal/{id}/edit page
 *
 * This allows us to display the full description of each permission, group and role on the edit page, giving the user
 * sufficient information to enable them to select the correct permission.
 *
 * Currently only the role names are used as a hint, to keep the interface clean, but future enhancements could include
 * the descriptions as well.
 *
 * @param {boolean} includeSuper - Whether to include the `super` permissions in the results. This is used when fetching
 * permissions for a user with `super` permissions, as they are the only ones where it should be included in the option
 * list on the edit page. For any other user, this should be false and the `super` permissions will not be included in
 * the results.
 *
 * @returns {Promise<object>} the full set of permissions, groups and roles for display on the internal user edit page
 */
async function go(includeSuper = false) {
  const uniqueGroupNames = _uniqueGroupNames()
  const uniqueRoleNames = _uniqueRoleNames()

  const allGroups = await GroupModel.query()
    .select(['description', 'group', 'id'])
    .whereIn('group', uniqueGroupNames)
    .orderBy('group')
    .withGraphFetched('roles')
    .modifyGraph('roles', (rolesBuilder) => {
      rolesBuilder.select(['description', 'roles.id', 'role']).orderBy('role')
    })

  const allRoles = await RoleModel.query()
    .select(['description', 'id', 'role'])
    .whereIn('role', uniqueRoleNames)
    .orderBy('role')

  return _userPermissions(allGroups, allRoles, includeSuper)
}

function _uniqueGroupNames() {
  const allGroupNames = Object.values(userPermissions)
    .map(({ groups }) => {
      return groups
    })
    .flat()

  return [...new Set(allGroupNames)]
}

function _uniqueRoleNames() {
  const allRoleNames = Object.values(userPermissions)
    .map(({ roles }) => {
      return roles
    })
    .flat()

  return [...new Set(allRoleNames)]
}

function _userPermission(userPermission, allGroups, allRoles) {
  const groups = allGroups.filter((group) => {
    return userPermission.groups.includes(group.group)
  })

  const roles = allRoles.filter((role) => {
    return userPermission.roles.includes(role.role)
  })

  return {
    ...userPermission,
    groups,
    roles
  }
}

/**
 * Makes a copy of the static userPermissions object, augmenting the `groups` and `roles` string values with the
 * corresponding IDs and descriptions from the database
 * @private
 */
function _userPermissions(allGroups, allRoles, includeSuper) {
  return Object.entries(userPermissions).reduce((decoratedValues, [key, value]) => {
    if (!includeSuper && key === 'super') {
      return decoratedValues
    }

    decoratedValues[key] = _userPermission(value, allGroups, allRoles)

    return decoratedValues
  }, {})
}

module.exports = {
  go
}
