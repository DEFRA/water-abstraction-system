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
 * @param {object} validationResult - The validation results from the payload
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, auth, validationResult) {
  return {
    anchor: _anchor(validationResult),
    backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
    caption: session.monitoringStationName,
    pageTitle: 'Select an email address to include in the alerts',
    username: auth.credentials.user.username
  }
}

function _anchor(validationResult) {
  if (!validationResult) {
    return null
  }

  if (validationResult.radioFormError) {
    return '#alertEmailAddress'
  }

  return '#otherUser'
}

module.exports = {
  go
}
