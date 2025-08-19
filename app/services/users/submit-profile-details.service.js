'use strict'

/**
 * Orchestrates validating and storing the data for `/users/me/profile-details` page
 * @module SubmitProfileDetailsService
 */

const ProfileDetailsValidator = require('../../validators/users/profile-details.validator.js')
const UserModel = require('../../models/user.model.js')

const NAVIGATION_LINKS = [
  { active: true, href: '/system/users/me/profile-details', text: 'Profile details' },
  { href: '/account/update-password', text: 'Change password' },
  { href: '/signout', text: 'Sign out' }
]

/**
 * Orchestrates validating and storing the data for `/users/me/profile-details` page
 *
 * If the details are successfully saved, it will additionally flash a notification.
 *
 * @param {number} userId - The ID of the user
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The page data for the profile details page including any validation error details
 */
async function go(userId, payload, yar) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(userId, payload)

    yar.flash('notification', {
      title: 'Updated',
      text: 'Profile details saved'
    })
  }

  return {
    navigationLinks: NAVIGATION_LINKS,
    pageTitle: 'Profile details',
    error: validationResult,
    ...payload
  }
}

async function _save(userId, payload) {
  const { address, email, jobTitle, name, tel } = payload

  return UserModel.query()
    .findById(userId)
    .patch({
      'userData:contactDetails.address': address || '',
      'userData:contactDetails.email': email || '',
      'userData:contactDetails.jobTitle': jobTitle || '',
      'userData:contactDetails.name': name || '',
      'userData:contactDetails.tel': tel || ''
    })
}

function _validate(payload) {
  const { error } = ProfileDetailsValidator.go(payload)

  if (!error) {
    return null
  }

  const formattedError = { errorList: [] }

  error.details.forEach((detail) => {
    // We validate that the email field is both a valid email and it is @environment-agency.gov.uk. If both fail Joi
    // will return both errors. In this case, there is no value in displaying the 'Email must be @envi...' if it is also
    // invalid. So, this ensures we get one email error displayed (invalid will always come first in the joi result)
    if (!formattedError[detail.context.key]) {
      formattedError.errorList.push({
        href: `#${detail.context.key}`,
        text: detail.message
      })

      formattedError[detail.context.key] = detail.message
    }
  })

  return formattedError
}

module.exports = {
  go
}
