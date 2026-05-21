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
 * @returns {Promise<string>} resetGuid - The reset GUID for the created user which is used in the email sent to the
 * user to complete their account set up
 */
async function go(session) {
  const { application, groups, roles } = userPermissions[session.permissions]

  // We do this because a "Basic access" user can be both internal and external, so we set it to be internal here
  const resolvedApplication = application === 'both' ? 'water_admin' : application

  return await UserModel.transaction(async (trx) => {
    const { id, resetGuid } = await _insertUser(resolvedApplication, session.email, trx)

    if (groups.length > 0) {
      await _insertUserGroups(groups, id, trx)
    }

    if (roles.length > 0) {
      await _insertUserRoles(roles, id, trx)
    }

    return resetGuid
  })
}

async function _insertUser(application, email, trx) {
  const userData = {
    application,
    badLogins: 0,
    password: hashSync(generateUUID(), 10), // Sets a random password
    username: email,
    resetGuid: generateUUID(),
    resetGuidCreatedAt: timestampForPostgres(),
    resetRequired: 1
  }

  return UserModel.query(trx).insert(userData).returning('id', 'resetGuid')
}

async function _insertUserGroups(groups, id, trx) {
  for (const group of groups) {
    const groupRecord = await GroupModel.query().select('id').findOne({ group })

    if (!groupRecord) {
      continue
    }

    await UserModel.relatedQuery('userGroups', trx).for(id).insert({ id: generateUUID(), groupId: groupRecord.id })
  }
}

async function _insertUserRoles(roles, id, trx) {
  for (const role of roles) {
    const roleRecord = await RoleModel.query().select('id').findOne({ role })

    if (!roleRecord) {
      continue
    }

    await UserModel.relatedQuery('userRoles', trx).for(id).insert({ id: generateUUID(), roleId: roleRecord.id })
  }
}

module.exports = {
  go
}
