/**
 * Fetches basic user details for user view pages
 * @module FetchUserDal
 */

import UserModel from '../../models/user.model.js'

/**
 * Fetches basic user details for user view pages
 *
 * @param {number} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
export default async function (id) {
  return UserModel.query().findById(id).select(['id', 'licenceEntityId', 'username'])
}
