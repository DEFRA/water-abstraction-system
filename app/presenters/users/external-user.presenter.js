'use strict'

const { formatLongDateTime } = require('../base.presenter.js')

/**
 * Formats data for external users on the `/users/{userId}` page
 * @module ExternalUserPresenter
 */

/**
 * Formats data for external users on the `/users/{userId}` page
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
    pageTitleCaption: 'External',
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
