'use strict'

/**
 * Formats error details from a notification ready for presenting in the view notification page
 * @module NotificationErrorPresenter
 */

const NOTIFY_ERRORS = {
  email: {
    'permanent-failure': 'The provider could not deliver the message because the email address was wrong.',
    'technical-failure': 'The message was not sent because there was a problem between Notify and the provider.',
    'temporary-failure': `The provider could not deliver the message. This can happen when the recipient's inbox is full or their anti-spam filter rejects the email.`
  },
  letter: {
    'permanent-failure': 'The provider cannot print the letter. Your letter will not be dispatched.',
    'technical-failure': 'GOV.UK Notify had an unexpected error while sending the letter to our printing provider.',
    'validation-failed': 'Content in the precompiled letter file is outside the printable area.',
    'virus-scan-failed': 'GOV.UK Notify found a potential virus in the precompiled letter file.'
  }
}

/**
 * Formats error details from a notification ready for presenting in the view notification page
 *
 * If the notification does not have a status of `error` it returns `null`.
 *
 * Else it determines a status and description to display on the view notification page based on the `notifyStatus`
 * and the `notifyError`.
 *
 * Generally the `notifyError` will get populated when a notification fails to send to Notify, for whatever reason
 * (issue on our side or Notify rejects it).
 *
 * This means `notifyStatus` will not get populated. If we have managed to send it, then we are interested in what
 * `notifyStatus` says, because we've marked the notification as errored because of it.
 *
 * We relay the description Notify provides in its docs when this is the case. We default to a generic message for
 * system errors because we're dealing with old records that might have all sorts in those error messages!
 *
 * @param {object} notification - The notification object to format error details for
 *
 * @returns {object|null} If the notification is not errored returns null, else an applicable 'status' and 'description'
 */
function go(notification) {
  const { messageType, notifyError, notifyStatus, status } = notification

  if (status !== 'error') {
    return null
  }

  if (notifyError) {
    return {
      status: notifyStatus ?? 'Not sent',
      description: 'Internal system error'
    }
  }

  return {
    status: notifyStatus,
    description: NOTIFY_ERRORS[messageType][notifyStatus]
  }
}

module.exports = {
  go
}
