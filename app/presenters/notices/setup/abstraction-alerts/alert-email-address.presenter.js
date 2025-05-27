'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 * @module AlertEmailAddressPresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {object} session - The session data
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, auth) {
  return {
    caption: session.monitoringStationName,
    pageTitle: 'Select an email address to include in the alerts',
    radioItems: [
      {
        value: 'username',
        text: auth.credentials.user.username
      },
      {
        divider: 'or'
      },
      {
        value: 'other',
        text: 'Use another email address'
      }
    ]
  }
}

module.exports = {
  go
}
