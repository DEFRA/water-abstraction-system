'use strict'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/permissions' page
 * @module PermissionsPresenter
 */

const { checkUrl } = require('../../../../lib/check-page.lib.js')

/**
 * Formats data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  return {
    backLink: {
      href: checkUrl(session, `/system/users/internal/setup/${session.id}/email`),
      text: 'Back'
    },
    pageTitle: 'Select permissions for the user',
    pageTitleCaption: 'Internal',
    permissions: session.permissions
  }
}

module.exports = {
  go
}
