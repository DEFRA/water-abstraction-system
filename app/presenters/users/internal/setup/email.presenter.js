'use strict'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/email' page
 * @module EmailPresenter
 */

const { formatEmail } = require('../../../base.presenter.js')

/**
 * Formats data for the '/users/internal/setup/{sessionId}/email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  return {
    activeNavBar: 'users',
    backLink: {
      href: _href(session),
      text: 'Back'
    },
    email: formatEmail(session.email),
    pageTitle: 'Enter an email address for the user',
    pageTitleCaption: 'Internal'
  }
}

function _href(session) {
  if (session.checkPageVisited) {
    return `/system/users/internal/setup/${session.id}/check`
  }

  return '/system/users'
}

module.exports = {
  go
}
