'use strict'

/**
 * Looks up a user's roles in the `idm` schema and returns the roles and groups assigned to them
 * @module GetUserRolesService
 */

const GroupRoleModel = require('../../models/idm/group-role.model.js')
const GroupModel = require('../../models/idm/group.model.js')
const RoleModel = require('../../models/idm/role.model.js')
const UserGroupModel = require('../../models/idm/user-group.model.js')
const UserRoleModel = require('../../models/idm/user-role.model.js')
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

  // TODO: make this a single query
  // Find all the roles the user has and extract their role ids
  const userRoles = await UserRoleModel.query().where({ userId: user.userId })
  const userRoleIds = userRoles.map(userRole => userRole.roleId)
  // Look up the roles by the ids
  const rolesForUser = await RoleModel.query().findByIds(userRoleIds)

  // Find all the groups the user is a member of and extract their group ids
  const userGroups = await UserGroupModel.query().where({ userId: user.userId })
  const userGroupIds = userGroups.map(userGroup => userGroup.groupId)
  // Get all the groups associated with the group ids and extract the role ids
  const groups = await GroupModel.query().findByIds(userGroupIds)
  const groupIds = groups.map(group => group.groupId)
  // Get all the roles associated with the groups
  const groupRoles = await GroupRoleModel.query().whereIn('groupId', groupIds)
  const groupRoleIds = groupRoles.map(groupRole => groupRole.roleId)
  // Look up the roles by the ids
  const rolesForGroups = await RoleModel.query().findByIds(groupRoleIds)

  return {
    userId: user.userId,
    groups,
    // TODO: dedupe roles if necessary
    roles: [...rolesForUser, ...rolesForGroups]
  }
}

module.exports = {
  go
}
