/**
 * Fetches an external user for display on the `/users/external/{id}/details` page
 * @module FetchUserDetailsDal
 */

import UserModel from '../../../models/user.model.js'

/**
 * Fetches an external user for display on the `/users/external/{id}/details` page
 *
 * @param {string} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
export default async function fetchUserDetails(id) {
  const user = await UserModel.query()
    .select(['id', 'licenceEntityId', 'username'])
    .modify('permissions')
    .modify('status')
    .findById(id)

  return user
}
