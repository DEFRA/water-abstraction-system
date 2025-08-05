'use strict'

/**
 * Formats data for the `/users/me/profile-details` page
 * @module ProfileDetailsPresenter
 */

/**
 * Formats data for the `/users/me/profile-details` page
 *
 * @param {object} profileDetails - The user's profile details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(profileDetails) {
  return {
    pageTitle: 'Profile details',
    ...profileDetails
  }
}

module.exports = {
  go
}
