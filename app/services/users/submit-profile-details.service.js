'use strict'

/**
 * Orchestrates validating the data for `/users/me/profile-details` page
 * @module SubmitProfileDetailsService
 */

const GeneralLib = require('../../lib/general.lib.js')
const UserModel = require('../../models/user.model.js')
const ProfileDetailsValidator = require('../../validators/users/profile-details.validator.js')

/**
 * Orchestrates validating the data for `/users/me/profile-details` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the site description in the payload is saved in the session. If there is a
 * validation error the controller will re-render the page. If all is well the controller will redirect to the next page
 * in the journey.
 *
 * @param {string} userId - The ID of the user
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The page data for the site description page including any validation error details
 */
async function go(userId, payload, yar) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(userId, payload)

    GeneralLib.flashNotification(yar, 'Updated', 'Profile details saved')
  }

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...payload
  }
}

async function _save(userId, payload) {
  const { address, email, jobTitle, name, tel } = payload

  return UserModel.query().findById(userId).patch({
    'userData:contactDetails.address': address,
    'userData:contactDetails.email': email,
    'userData:contactDetails.jobTitle': jobTitle,
    'userData:contactDetails.name': name,
    'userData:contactDetails.tel': tel
  })
}

function _validate(payload) {
  const validation = ProfileDetailsValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
