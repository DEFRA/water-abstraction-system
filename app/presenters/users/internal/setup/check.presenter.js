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
  const { email, id: sessionId, permission } = session

  return {
    activeNavBar: 'users',
    email,
    links: {
      email: `/system/users/internal/setup/${sessionId}/email`,
      permissions: `/system/users/internal/setup/${sessionId}/permissions`
    },
    pageTitle: 'Check user',
    pageTitleCaption: 'Internal',
    permission: userPermissions[permission].label
  }
}

module.exports = {
  go
}
