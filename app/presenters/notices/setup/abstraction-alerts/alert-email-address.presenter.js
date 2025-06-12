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
 * @param {object} payload - The submitted form data
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, auth, validationResult) {
  const { alertEmailAddress, alertEmailAddressType, monitoringStationName, id: sessionId } = session

  return {
    alertEmailAddressOptions: _alertEmailAddressOptions(alertEmailAddress, alertEmailAddressType),
    anchor: _anchor(validationResult),
    backLink: `/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`,
    caption: monitoringStationName,
    pageTitle: 'Select an email address to include in the alerts',
    username: auth.credentials.user.username
  }
}

function _alertEmailAddressOptions(alertEmailAddress, alertEmailAddressType) {
  const usernameChecked = alertEmailAddressType === 'username'
  const otherUserChecked = alertEmailAddressType === 'other'

  const otherUserEmailAddressInput = otherUserChecked ? alertEmailAddress : ''

  return {
    otherUserChecked,
    otherUserEmailAddressInput,
    usernameChecked
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
