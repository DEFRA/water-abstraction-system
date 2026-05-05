'use strict'

/**
 * Checks if an email address already exists in the system.
 * @module CheckEmailExistsDal
 */

const UserModel = require('../../models/user.model.js')

/**
 * Checks if an email address already exists in the system.
 *
 * @param {string} email - The email address to check.
 *
 * @returns {Promise<boolean>} Returns `true` if the email exists, `false` otherwise.
 */
async function go(email) {
  const emailExists = await UserModel.query().findOne({ username: email })

  return !!emailExists
}

module.exports = {
  go
}
