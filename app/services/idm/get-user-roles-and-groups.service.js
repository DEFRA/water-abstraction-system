'use strict'

/**
 * Looks up a user in the `idm` schema and returns the roles and groups assigned to them
 * @module GetUserRolesAndGroupsService
 */

const UserModel = require('../../models/idm/user.model.js')

/**
 * A user can have roles assigned to them in two ways:
 *
 * - By directly assigning roles to the user;
 * - By adding the user to a group, and assigning roles to the group.
 *
 * This service looks up the user in the `idm` (identity management) schema and returns a combined array of all roles
 * (deduped in case the user is given the same role multiple times; for example, by being assigned a role directly, then
 * later added to a group which also includes that role). It also returns an array of groups that the user is a member
 * of.
 *
 * @param {Number} userId The user id to get roles and groups for
 *
 * @returns {Object} result The resulting roles and groups
 * @returns {RoleModel[]} result.roles An array of RoleModel objects representing the roles the user has
 * @returns {GroupModel[]} result.groups An array of GroupModel objects representing the groups the user is a member of
 */
async function go (userId) {
  const user = await UserModel.query()
    .findById(userId)
    .withGraphFetched('[roles, groups.roles]')

  if (!user) {
    return {
      roles: [],
      groups: []
    }
  }

  const { groups, roles } = user
  const rolesFromGroups = _extractRolesFromGroups(groups)
  const combinedAndDedupedRoles = _combineAndDedupeRoles([...roles, ...rolesFromGroups])

  return {
    roles: combinedAndDedupedRoles,
    groups
  }
}

/**
 * The roles that the user is assigned to via groups are returned from our main query within the user's Group objects.
 * We want to extract the roles and remove them from the groups in order to keep the Group objects clean and avoid
 * duplication in the object returned by the service. This function returns a flat array of all the group Roles objects,
 * deleting them from the Group objects in the process
 */
function _extractRolesFromGroups (groups) {
  return groups.flatMap((group) => {
    const { roles } = group
    delete group.roles
    return roles
  })
}

function _combineAndDedupeRoles (rolesArrayToDedupe) {
  // Our usual method of deduping arrays (putting the array into a new Set and then spreading it back into an array)
  // doesn't work here as the Role objects are not considered to be equal when doing this. We therefore use reduce to
  // dedupe by going through each Role object in the original array and only adding it to the accumulated results array
  // if a Role object with the same id isn't already in it
  const dedupedArray = rolesArrayToDedupe.reduce((acc, current) => {
    const roleIsAlreadyInAcc = acc.find((item) => {
      return item.roleId === current.roleId
    })

    if (!roleIsAlreadyInAcc) {
      acc.push(current)
    }

    return acc
  }, [])

  return dedupedArray
}

module.exports = {
  go
}
