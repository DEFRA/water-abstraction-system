'use strict'

/**
 * Orchestrates validating and storing the data for `/users/me/profile-details` page
 * @module SubmitProfileDetailsService
 */

const { ref } = require('objection')

const ProfileDetailsPresenter = require('../../presenters/users/profile-details.presenter.js')
const ProfileDetailsValidator = require('../../validators/users/profile-details.validator.js')
const UserModel = require('../../models/user.model.js')

const { formatValidationResult } = require('../../presenters/base.presenter.js')

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
      text: 'Profile details updated'
    })
  }

  const pageData = ProfileDetailsPresenter.go(payload)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(userId, payload) {
  const { address, email, jobTitle, name, tel } = payload

  // Ensure userData and contactDetails objects exist - if they don't, the patch just silently fails
  await UserModel.query().where('userId', userId).whereNull('userData').patch({ userData: {} })
  await UserModel.query()
    .where('userId', userId)
    .whereNull(ref('userData:contactDetails'))
    .patch({ 'userData:contactDetails': {} })

  return UserModel.query()
    .where('userId', userId)
    .patch({
      'userData:contactDetails.address': address || '',
      'userData:contactDetails.email': email || '',
      'userData:contactDetails.jobTitle': jobTitle || '',
      'userData:contactDetails.name': name || '',
      'userData:contactDetails.tel': tel || ''
    })
}

function _validate(payload) {
  const validationResult = ProfileDetailsValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
