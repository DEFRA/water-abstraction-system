/**
 * Checks if an email address already exists in the system.
 * @module CheckEmailExistsDal
 */

import UserModel from '../../models/user.model.js'

/**
 * Checks if an email address already exists in the system.
 *
 * @param {string} email - The email address to check.
 *
 * @returns {Promise<boolean>} Returns `true` if the email exists, `false` otherwise.
 */
export default async function checkEmailExistsDal(email) {
  const emailExists = await UserModel.query().findOne({ username: email })

  return !!emailExists
}
