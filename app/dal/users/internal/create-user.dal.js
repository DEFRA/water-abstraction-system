'use strict'

/**
 * Creates a new user
 * @module CreateUserDal
 */

const { hashSync } = require('bcryptjs')

const GroupModel = require('../../../models/group.model.js')
const RoleModel = require('../../../models/role.model.js')
const UserModel = require('../../../models/user.model.js')
const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const { userPermissions } = require('../../../lib/static-lookups.lib.js')

/**
 * Creates a new user
 *
 * @param {object} session - The session instance
 *
 * @returns {Promise<string>} The reset GUID for the created user
 */
async function go(session) {
  const { email, permission } = session
  const { application, groups, roles } = userPermissions[permission]

  // We do this because a "Basic access" user can be both internal and external, so we set it to be internal here
  const resolvedApplication = application === 'both' ? 'water_admin' : application

  const groupIds = await GroupModel.query().select('id').whereIn('group', groups)
  const roleIds = await RoleModel.query().select('id').whereIn('role', roles)

  return UserModel.transaction(async (trx) => {
    const { id, resetGuid } = await _insertUser(resolvedApplication, email, trx)

    if (groupIds.length > 0) {
      await _insertUserGroups(groupIds, id, trx)
    }

    if (roleIds.length > 0) {
      await _insertUserRoles(roleIds, id, trx)
    }

    return resetGuid
  })
}

async function _insertUser(application, email, trx) {
  const userData = {
    application,
    badLogins: 0,
    password: hashSync(generateUUID(), 10), // Sets a random password
    resetGuid: generateUUID(),
    resetGuidCreatedAt: timestampForPostgres(),
    resetRequired: 1,
    username: email
  }

  return UserModel.query(trx).insert(userData).returning('id', 'resetGuid')
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

module.exports = {
  go
}
