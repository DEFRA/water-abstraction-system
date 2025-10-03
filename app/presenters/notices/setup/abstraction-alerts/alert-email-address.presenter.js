'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 * @module AlertEmailAddressPresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} payload - The submitted form data
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, auth) {
  const { alertEmailAddress, alertEmailAddressType, monitoringStationName, id: sessionId } = session

  return {
    alertEmailAddressOptions: _alertEmailAddressOptions(alertEmailAddress, alertEmailAddressType),
    backLink: { href: `/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`, text: 'Back' },
    pageTitle: 'Select an email address to include in the alerts',
    pageTitleCaption: monitoringStationName,
    username: auth.credentials.user.username
  }
}

function _alertEmailAddressOptions(alertEmailAddress, alertEmailAddressType) {
  const usernameChecked = alertEmailAddressType === 'username'
  const otherUserChecked = alertEmailAddressType === 'other'

  const otherUserEmailAddressInput = otherUserChecked && alertEmailAddress ? alertEmailAddress : ''

  return {
    otherUserChecked,
    otherUserEmailAddressInput,
    usernameChecked
  }
}

module.exports = {
  go
}
