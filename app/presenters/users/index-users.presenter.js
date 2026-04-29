'use strict'

/**
 * Formats data for the `/users` page
 * @module IndexUsersPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/users` page
 *
 * @param {module:UserModel[]} users - An array of users to display
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(users, auth) {
  const { scope } = auth.credentials

  return {
    links: _links(scope),
    pageTitle: 'Users',
    users: _userRowData(users)
  }
}

function _link(user) {
  const { id } = user

  if (user.$internal()) {
    return `/system/users/internal/${id}`
  }

  return `/system/users/external/${id}`
}

function _links(scope) {
  const links = {}

  if (scope.includes('manage_accounts')) {
    const href = FeatureFlagsConfig.enableUsersManagement ? '/system/users/internal/setup' : '/account/create-user'

    links.user = {
      text: 'Create a user',
      href
    }
  }

  return links
}

function _userRowData(users) {
  return users.map((user) => {
    const { username: email } = user

    return {
      email,
      link: _link(user),
      permissions: user.$permissions()?.label || '',
      status: user.$status(),
      type: user.$internal() ? 'Internal' : 'External'
    }
  })
}

module.exports = {
  go
}
