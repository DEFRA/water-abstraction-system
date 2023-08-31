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
  const user = await UserModel.query()
    .findById(userId)
    .withGraphFetched('[roles, groups.roles]')

  const { groups, roles } = user
  const rolesFromGroups = _extractRolesFromGroups(groups)
  const combinedAndDedupedRoles = _combineAndDedupeRoles(roles, rolesFromGroups)

  return {
    userId: user.userId,
    groups,
    roles: combinedAndDedupedRoles
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

function _combineAndDedupeRoles (roles, rolesFromGroups) {
  const combinedRolesArray = [...roles, ...rolesFromGroups]

  // Our usual method of deduping arrays (putting the array into a new Set and then spreading it back into an array)
  // doesn't work here as the role objects are not considered to be equal when doing this. We therefore use reduce to
  // dedupe by going through each role and only adding it to the accumulated results array if a role with the same id
  // isn't already in the array
  const dedupedArray = combinedRolesArray.reduce((acc, current) => {
    if (!acc.find((item) => item.roleId === current.roleId)) {
      acc.push(current)
    }
    return acc
  }, [])

  return dedupedArray
}

module.exports = {
  go
}
