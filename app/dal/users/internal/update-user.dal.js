/**
 * Updates an existing user
 * @module UpdateUserDal
 */

import EventModel from '../../../models/event.model.js'
import FetchUserDal from '../fetch-user.dal.js'
import GroupModel from '../../../models/group.model.js'
import RoleModel from '../../../models/role.model.js'
import UserGroupModel from '../../../models/user-group.model.js'
import UserModel from '../../../models/user.model.js'
import UserRoleModel from '../../../models/user-role.model.js'
import { userPermissions } from '../../../lib/static-lookups.lib.js'
import { generateUUID, timestampForPostgres } from '../../../lib/general.lib.js'

/**
 * Updates an existing user
 *
 * @param {object} auth - The current user's authentication details from `request.auth`
 * @param {object} session - The session instance
 *
 * @returns {Promise<string>} The resetGuid for the updated user
 */
export default async function updateUserDal(auth, session) {
  const { access, email, permission, user } = session

  const { currentPermission, id, userId, username: currentUsername } = user

  const newGroupsRoles = await _newGroupsRoles(currentPermission, permission)

  const { username: issuer } = await FetchUserDal(auth.credentials.user.id)

  return UserModel.transaction(async (trx) => {
    const resetGuid = await _updateUser(access, currentUsername, email, id, trx)

    if (newGroupsRoles) {
      await _insertUserGroupsRoles(newGroupsRoles, userId, trx)
    }

    await _insertEvent(email, issuer, userId, trx)

    return resetGuid
  })
}

async function _deleteExistingGroupsRoles(userId, trx) {
  await Promise.all([
    UserGroupModel.query(trx).delete().where('userId', userId),
    UserRoleModel.query(trx).delete().where('userId', userId)
  ])
}

async function _insertEvent(email, issuer, userId, trx) {
  const timestamp = timestampForPostgres()

  const eventData = {
    createdAt: timestamp,
    entities: [],
    issuer,
    licences: [],
    metadata: { user: email, userId },
    subtype: 'internal',
    type: 'update-user-roles',
    updatedAt: timestamp
  }

  return EventModel.query(trx).insert(eventData)
}

async function _insertUserGroups(groupIds, userId, trx) {
  for (const { id: groupId } of groupIds) {
    await UserGroupModel.query(trx).insert({ id: generateUUID(), groupId, userId })
  }
}

async function _insertUserGroupsRoles(newGroupsRoles, userId, trx) {
  const { groupIds, roleIds } = newGroupsRoles

  await _deleteExistingGroupsRoles(userId, trx)

  if (groupIds.length > 0) {
    await _insertUserGroups(groupIds, userId, trx)
  }

  if (roleIds.length > 0) {
    await _insertUserRoles(roleIds, userId, trx)
  }
}

async function _insertUserRoles(roleIds, userId, trx) {
  for (const { id: roleId } of roleIds) {
    await UserRoleModel.query(trx).insert({ id: generateUUID(), roleId, userId })
  }
}

async function _newGroupsRoles(currentPermission, permission) {
  if (permission === currentPermission) {
    return null
  }

  const { groups, roles } = userPermissions[permission]

  const [groupIds, roleIds] = await Promise.all([
    GroupModel.query().select('id').whereIn('group', groups),
    RoleModel.query().select('id').whereIn('role', roles)
  ])

  return { groupIds, roleIds }
}

async function _updateUser(access, currentUsername, email, id, trx) {
  const userData = { updatedAt: timestampForPostgres() }

  userData.enabled = access === 'enabled'

  if (email !== currentUsername) {
    userData.resetGuid = generateUUID()
    userData.username = email
  }

  await UserModel.query(trx).findById(id).patch(userData)

  return userData.resetGuid
}
