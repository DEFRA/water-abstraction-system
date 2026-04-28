'use strict'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/user-email' page
 * @module UserEmailPresenter
 */

const { checkUrl } = require('../../../../lib/check-page.lib.js')
const { formatEmail } = require('../../../base.presenter.js')

/**
 * Formats data for the '/users/internal/setup/{sessionId}/user-email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  return {
    backLink: {
      href: checkUrl(session, '/system/users'),
      text: 'Back'
    },
    pageTitle: 'Enter an email address for the user',
    pageTitleCaption: 'Internal',
    email: formatEmail(session.email)
  }
}

module.exports = {
  go
}
