/**
 * Creates a new user
 * @module CreateUserDal
 */

import { hashSync } from 'bcryptjs'

import EventModel from '../../../models/event.model.js'
import FetchUserDal from '../fetch-user.dal.js'
import GroupModel from '../../../models/group.model.js'
import RoleModel from '../../../models/role.model.js'
import UserModel from '../../../models/user.model.js'
import { generateUUID, timestampForPostgres } from '../../../lib/general.lib.js'
import { userPermissions } from '../../../lib/static-lookups.lib.js'

/**
 * Creates a new user
 *
 * @param {object} auth - The current user's authentication details from `request.auth`
 * @param {object} session - The session instance
 *
 * @returns {Promise<string>} The resetGuid for the new user
 */
async function go(auth, session) {
  const { email, permission } = session
  const { groups, roles } = userPermissions[permission]

  const groupIds = await GroupModel.query().select('id').whereIn('group', groups)
  const roleIds = await RoleModel.query().select('id').whereIn('role', roles)

  return UserModel.transaction(async (trx) => {
    const { id, resetGuid, userId } = await _insertUser(email, trx)

    if (groupIds.length > 0) {
      await _insertUserGroups(groupIds, id, trx)
    }

    if (roleIds.length > 0) {
      await _insertUserRoles(roleIds, id, trx)
    }

    await _insertEvent(auth, email, userId, trx)

    return resetGuid
  })
}

async function _insertEvent(auth, email, userId, trx) {
  const { username } = await FetchUserDal.go(auth.credentials.user.id)

  const timestamp = timestampForPostgres()

  const eventData = {
    createdAt: timestamp,
    entities: [],
    issuer: username,
    licences: [],
    metadata: { user: email, userId },
    subtype: 'internal',
    type: 'new-user',
    updatedAt: timestamp
  }

  return EventModel.query(trx).insert(eventData)
}

async function _insertUser(email, trx) {
  const userData = {
    application: 'water_admin',
    badLogins: 0,
    password: hashSync(generateUUID(), 10), // Sets a random password
    resetGuid: generateUUID(),
    resetGuidCreatedAt: timestampForPostgres(),
    resetRequired: 1,
    username: email
  }

  return UserModel.query(trx).insert(userData).returning('id', 'resetGuid', 'userId')
}

async function _insertUserGroups(groupIds, id, trx) {
  for (const { id: groupId } of groupIds) {
    await UserModel.relatedQuery('userGroups', trx).for(id).insert({ id: generateUUID(), groupId })
  }
}

async function _insertUserRoles(roleIds, id, trx) {
  for (const { id: roleId } of roleIds) {
    await UserModel.relatedQuery('userRoles', trx).for(id).insert({ id: generateUUID(), roleId })
  }
}

export {
  go
}
export default {
  go
}
