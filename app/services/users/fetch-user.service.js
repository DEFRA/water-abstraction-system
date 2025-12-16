'use strict'

/**
 * Handles fetching search results for users on the `/profiles/me/details` page
 * @module FetchUserService
 */

const { ref } = require('objection')

const UserModel = require('../../models/user.model.js')

/**
 * Handles fetching search results for users on the `/profiles/me/details` page
 *
 * @param {string} userId - The value to search for, taken from the session
 *
 * @returns {Promise<object>} The users details
 */
async function go(userId) {
  return UserModel.query()
    .findById(userId)
    .select([
      ref('userData:contactDetails.address').castText().as('address'),
      ref('userData:contactDetails.email').castText().as('email'),
      ref('userData:contactDetails.jobTitle').castText().as('jobTitle'),
      ref('userData:contactDetails.name').castText().as('name'),
      ref('userData:contactDetails.tel').castText().as('tel')
    ])
}

module.exports = {
  go
}
