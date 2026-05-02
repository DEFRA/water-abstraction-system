'use strict'

/**
 * Fetches the user details needed for the view `/users/internal/{id}/details` page
 * @module FetchUserDal
 */

const UserModel = require('../../../models/user.model.js')

/**
 * Fetches the user details needed for the view `/users/internal/{id}/details` page
 *
 * @param {number} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(id) {
  return UserModel.query()
    .select(['id', 'username'])
    .modify('status')
    .modify('permissions')
    .findById(id)
    .withGraphFetched('groups')
    .modifyGraph('groups', (groupsBuilder) => {
      groupsBuilder
        .select(['groups.id'])
        .withGraphFetched('roles')
        .modifyGraph('roles', (rolesBuilder) => {
          rolesBuilder.select(['description', 'roles.id', 'role']).orderBy([
            { column: 'role', order: 'asc' },
            { column: 'description', order: 'asc' }
          ])
        })
    })
    .withGraphFetched('roles')
    .modifyGraph('roles', (rolesBuilder) => {
      rolesBuilder.select(['description', 'roles.id', 'role']).orderBy([
        { column: 'role', order: 'asc' },
        { column: 'description', order: 'asc' }
      ])
    })
}

module.exports = {
  go
}
