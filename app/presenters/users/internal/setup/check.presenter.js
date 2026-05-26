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
  return {
    activeNavBar: 'users',
    email: session.email,
    links: {
      email: `/system/users/internal/setup/${session.id}/email`,
      permissions: `/system/users/internal/setup/${session.id}/permissions`
    },
    pageTitle: 'Check user',
    pageTitleCaption: 'Internal',
    permission: userPermissions[session.permission].label
  }
}

module.exports = {
  go
}
