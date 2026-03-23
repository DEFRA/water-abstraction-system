'use strict'

/**
 * Update the user data for the `/users/internal/{id}/edit` page
 *
 * @module UpdateUserService
 */

const { raw } = require('objection')

const UserModel = require('../../../models/user.model.js')
const UserGroupModel = require('../../../models/user-group.model.js')
const UserRoleModel = require('../../../models/user-role.model.js')

/**
 * Update the user data for the `/users/internal/{id}/edit` page
 *
 * The user data is updated by deleting the existing `user_groups` and `user_roles` records, before inserting new ones.
 *
 * There are a few issues with these tables that make this approach necessary:
 *
 * - They have a unique ID field, which is not really needed as the combination of `userId` and `groupId` / `roleId`
 * should be unique
 * - Their unique ID field is not automatically generated, which means that values have to be generated manually when
 * inserting records
 * - They have no unique constraint on the combination of `userId` and `groupId` / `roleId`, which means that duplicate
 * records could be inserted
 * - They use the old numeric `user_id` field for the user rather than the new user UUID, so we have to use the
 * `userId` field instead of the `id` field for the user
 * - Groups and Roles have to have a unique name, but they are linked by their UUID, so we have to query the database to
 * get the UUIDs for the groups and roles based on their names (these things really don't need to exist in the database,
 * they could just be hardcoded in the codebase as they are unlikely to change and are not really data - we have already
 * introduced the concept of a "permissions" value that encapsulates the user's scopes, so we could eventually just use
 * that instead of all these tables)
 *
 * Hence, for now, the approach of just deleting all the existing records and inserting new ones, which is how the
 * legacy application handles it.
 *
 * The best solution would be to replace all this with a simple `permissions` value on the user record - once the
 * migration of all user functionality from the legacy systems has been completed that would probably be the approach to
 * take.
 *
 * @param {module:UserModel} user - The user, with its new `groups` and `roles` relations, to update
 *
 * @returns {Promise<Array>} The results from all the deletes and inserts
 */
async function go(user) {
  return _update(user)
}

async function _update(user) {
  return UserModel.transaction(async (trx) => {
    const deleteResults = await Promise.all([
      UserGroupModel.query(trx).delete().where('userId', user.userId),
      UserRoleModel.query(trx).delete().where('userId', user.userId)
    ])

    const userGroups = _userGroups(user)
    const userRoles = _userRoles(user)
    const inserts = []

    if (userGroups.length) {
      inserts.push(UserGroupModel.query(trx).insert(userGroups))
    }

    if (userRoles.length) {
      inserts.push(UserRoleModel.query(trx).insert(userRoles))
    }

    const insertResults = await Promise.all(inserts)

    return [...deleteResults, ...insertResults]
  })
}

function _userGroups(user) {
  return user.groups.map((group) => {
    return {
      groupId: group.id,
      id: raw('gen_random_uuid()'),
      userId: user.userId
    }
  })
}

function _userRoles(user) {
  return user.roles.map((role) => {
    return {
      id: raw('gen_random_uuid()'),
      roleId: role.id,
      userId: user.userId
    }
  })
}

module.exports = {
  go
}
