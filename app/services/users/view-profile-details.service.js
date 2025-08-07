'use strict'

const { ref } = require('objection')

/**
 * Orchestrates fetching and presenting the data for `/profiles/me/details` page
 * @module ViewProfileDetailsService
 */

const UserModel = require('../../models/user.model.js')
const ProfileDetailsPresenter = require('../../presenters/users/profile-details.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/users/me/profile-details` page
 *
 * Supports generating the data needed for the site description page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {number} userId - The user's ID
 *
 * @returns {Promise<object>} The view data for the profile details page
 */
async function go(userId) {
  const profileDetails =  await UserModel.query().findById(userId).select([
    ref('userData:contactDetails.address').castText().as('address'),
    ref('userData:contactDetails.email').castText().as('email'),
    ref('userData:contactDetails.jobTitle').castText().as('jobTitle'),
    ref('userData:contactDetails.name').castText().as('name'),
    ref('userData:contactDetails.tel').castText().as('tel')
  ])

  const formattedData = ProfileDetailsPresenter.go(profileDetails)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
