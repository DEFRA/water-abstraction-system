/**
 * Fetches the user details needed for user pages
 * @module FetchUserDetailsDal
 */

import UserModel from '../../../models/user.model.js'

/**
 * Fetches the user details needed for user pages
 *
 * @param {number} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
export default async function (id) {
  return UserModel.query()
    .select(['id', 'userId', 'username'])
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
