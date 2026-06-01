'use strict'

/**
 * Formats data for external users on the `/users/external/setup/{id}/cancel` page
 * @module CancelPresenter
 */

const { formatLicencesToUnlink } = require('../../base-users.presenter.js')

/**
 * Formats data for external users on the `/users/external/setup/{id}/cancel` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const licences = formatLicencesToUnlink(session)

  return {
    activeNavBar: session.activeNavBar,
    backLink: {
      href: `/system/users/external/setup/${session.id}/check`,
      text: 'Back'
    },
    licences,
    pageTitle: 'You are about to cancel unregistering these licences',
    pageTitleCaption: session.user.username
  }
}

module.exports = {
  go
}
