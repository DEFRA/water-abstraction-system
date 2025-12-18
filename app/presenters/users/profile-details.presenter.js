'use strict'

/**
 * Formats data for the `/users/me/profile-details` page
 * @module ProfileDetailsPresenter
 */

const NAVIGATION_LINKS = [
  { active: true, href: '/system/users/me/profile-details', text: 'Profile details' },
  { href: '/account/update-password', text: 'Change password' },
  { href: '/signout', text: 'Sign out' }
]

/**
 * Formats data for the `/users/me/profile-details` page
 *
 * @param {module:UserModel} profileDetails - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(profileDetails) {
  return {
    address: profileDetails.address || '',
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    email: profileDetails.email || '',
    jobTitle: profileDetails.jobTitle || '',
    name: profileDetails.name || '',
    navigationLinks: NAVIGATION_LINKS,
    pageTitle: 'Profile details',
    tel: profileDetails.tel || ''
  }
}

module.exports = {
  go
}
