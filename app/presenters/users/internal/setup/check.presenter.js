'use strict'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/check' page
 * @module CheckPresenter
 */

const { userPermissions } = require('../../../../lib/static-lookups.lib.js')

/**
 * Formats data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { email, id: sessionId, permission, user } = session

  return {
    activeNavBar: 'users',
    email,
    links: {
      cancel: `/system/users/internal/setup/${sessionId}/cancel`,
      email: `/system/users/internal/setup/${sessionId}/email`,
      permissions: `/system/users/internal/setup/${sessionId}/permissions`
    },
    pageTitle: 'Check user',
    pageTitleCaption: 'Internal',
    permission: userPermissions[permission].label,
    // Only allow changing the email address if this is a new user or the user has not yet verified their email address
    showEmailChangeLink: !user || user.status === 'awaiting'
  }
}

module.exports = {
  go
}
