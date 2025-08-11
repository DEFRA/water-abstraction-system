'use strict'

const { ref } = require('objection')

/**
 * Orchestrates fetching and presenting the data for `/profiles/me/details` page
 * @module ViewProfileDetailsService
 */

const UserModel = require('../../models/user.model.js')

const navigationLinks = [
  { active: true, href: '/contact-information', text: 'Contact information' },
  { href: '/account/update-password', text: 'Change password' },
  { href: '/signout', text: 'Sign out' }
]

/**
 * Orchestrates fetching and presenting the data for `/users/me/profile-details` page
 *
 * The required fields are held in an attribute called `contactDetails` in the `userData` JSON field in the UserModel.
 * This requires use of the `ref` function to access the nested fields as well as casting them to Objection's text type
 * and giving them appropriate aliases.
 *
 * @param {number} userId - The user's ID
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The view data for the profile details page
 */
async function go(userId, yar) {
  const profileDetails = await UserModel.query()
    .findById(userId)
    .select([
      ref('userData:contactDetails.address').castText().as('address'),
      ref('userData:contactDetails.email').castText().as('email'),
      ref('userData:contactDetails.jobTitle').castText().as('jobTitle'),
      ref('userData:contactDetails.name').castText().as('name'),
      ref('userData:contactDetails.tel').castText().as('tel')
    ])

  const notification = yar.flash('notification')[0]

  return {
    navigationLinks,
    notification,
    pageTitle: 'Profile details',
    ...profileDetails
  }
}

module.exports = {
  go
}
