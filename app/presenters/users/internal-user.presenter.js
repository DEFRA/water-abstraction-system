'use strict'

/**
 * Formats data for internal users on the `/users/{userId}` page
 * @module InternalUserPresenter
 */

const { formatLongDateTime } = require('../base.presenter.js')

/**
 * Formats data for internal users on the `/users/{userId}` page
 *
 * @param {module:UserModel} user - The user instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(user) {
  const { id, username } = user

  return {
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    id,
    lastSignedIn: _lastSignedIn(user),
    pageTitle: `User ${username}`,
    pageTitleCaption: 'Internal',
    permissions: user.$permissions().label,
    status: user.$status()
  }
}

function _lastSignedIn(user) {
  const { lastLogin } = user

  if (!lastLogin) {
    return 'Never signed in'
  }

  return `Last signed in ${formatLongDateTime(lastLogin)}`
}

module.exports = {
  go
}
