/**
 * Checks if an email address already exists in the system
 * @module CheckEmailExistsDal
 */

import UserModel from '../../models/user.model.js'

/**
 * Checks if an email address already exists in the system
 *
 * Obviously we don't want to try and create duplicate user accounts. But in WRLS they are split by application type;
 * 'water_admin' for internal users, 'water_vml' for external users.
 *
 * It is common for some EA staff to have both an internal and external user account. For some it allows them to deal
 * with queries about the external service. For others, they user the external service to submit returns on behalf of
 * licences held by the Environment Agency.
 *
 * So, we don't care if an external user account exists with the same email address. We only care if an internal user
 * account exists.
 *
 * @param {string} email - The email address to check.
 *
 * @returns {Promise<boolean>} Returns `true` if an existing internal user with the same email exists, otherwise `false`
 */
export default async function checkEmailExistsDal(email) {
  const emailExists = await UserModel.query().findOne({ application: 'water_admin', username: email })

  return !!emailExists
}
