'use strict'

/**
 * Fetches the details of the groups and roles for a specific permission for the `/users/internal/{id}/edit` page
 * @module FetchPermissionsDetailsService
 */

const GroupModel = require('../../../models/group.model.js')
const RoleModel = require('../../../models/role.model.js')

const { userPermissions } = require('../../../lib/static-lookups.lib.js')

/**
 * Fetches the details of the groups and roles for a specific permission for the `/users/internal/{id}/edit` page
 *
 * This service just augments the static userPermissions object with the relevant group and role IDs from the database,
 * as that is what is required to update the permissions.
 *
 * So for a permission of `nps_ar_user`, the return value is transformed from the original static permission object:
 *
 * ```
 * {
 *   application: 'water_admin',
 *   groups: ['nps'],
 *   key: 'nps_ar_user',
 *   label: 'National Permitting Service and Digitise! editor',
 *   roles: ['ar_user']
 * }
 * ```
 *
 * to something like this:
 *
 * ```
 * {
 *   application: 'water_admin',
 *   groups: [{ group: 'nps', id: '1234-1234-1234-1234' }],
 *   key: 'nps_ar_user',
 *   label: 'National Permitting Service and Digitise! editor',
 *   roles: [{ role: 'ar_user', id: '5678-5678-5678-5678' }]
 * }
 * ```
 *
 * This is needed because the database has randomly-generated UUIDs as keys for groups and roles, which we need to
 * look up in order to update the permissions correctly.
 *
 * These could be done individually for each group and role insertion when updating the permissions, but it is more
 * efficient to do it all in one go here and the update service already has quite a lot to do, dealing with transactions
 * and multiple deletes/inserts.
 *
 * @param {string} permission - The permission to fetch the details for
 *
 * @returns {Promise<object>} the relevant permission but with the database details of its groups and roles instead of
 * just the names
 */
async function go(permission) {
  const userPermission = userPermissions[permission]
  const { groups: groupNames, roles: roleNames } = userPermission

  const [groups, roles] = await Promise.all([_groups(groupNames), _roles(roleNames)])

  return {
    ...userPermission,
    groups,
    roles
  }
}

async function _groups(groupNames) {
  if (groupNames.length === 0) {
    return []
  }

  return GroupModel.query().select(['group', 'id']).whereIn('group', groupNames)
}

async function _roles(roleNames) {
  if (roleNames.length === 0) {
    return []
  }

  return RoleModel.query().select(['id', 'role']).whereIn('role', roleNames)
}

module.exports = {
  go
}
