'use strict'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/cancel' page
 * @module CancelPresenter
 */

const { userPermissions } = require('../../../../lib/static-lookups.lib.js')

/**
 * Formats data for the '/users/internal/setup/{sessionId}/cancel' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { email, permission } = session

  return {
    activeNavBar: 'users',
    email,
    pageTitle: 'You are about to cancel this user',
    pageTitleCaption: 'Internal',
    permission: userPermissions[permission].label
  }
}

module.exports = {
  go
}
