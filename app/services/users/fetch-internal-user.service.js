'use strict'

/**
 * Fetches an internal user for display on the /internal-users/{userId} page
 * @module FetchInternalUserService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches an internal user for display on the /internal-users/{userId} page
 *
 * @param {number} userId - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(userId) {
  return UserModel.query()
    .select(['id', 'username'])
    .modify('status')
    .modify('permissions')
    .findById(userId)
    .withGraphFetched('groups')
    .modifyGraph('groups', (groupsBuilder) => {
      groupsBuilder
        .select(['groups.id'])
        .withGraphFetched('roles')
        .modifyGraph('roles', (rolesBuilder) => {
          rolesBuilder.select(['description', 'roles.id', 'role'])
        })
    })
    .withGraphFetched('roles')
    .modifyGraph('roles', (rolesBuilder) => {
      rolesBuilder.select(['description', 'roles.id', 'role'])
    })
}

module.exports = {
  go
}
