'use strict'

/**
 * Formats error details from a notification ready for presenting in the view notification page
 * @module NotificationErrorPresenter
 */

const KNOWN_ERRORS = [
  {
    match: 'is required',
    description: 'The notification was sent missing some data needed for the template'
  },
  {
    match: 'must not start',
    description: 'Address lines must not start with any of the following characters: @ ( ) = [ ] ” \\\\ / , < >'
  },
  {
    match: 'real UK postcode',
    description: 'The last line of address must be a real UK postcode or another country'
  },
  {
    match: 'PDF',
    description: 'There was an error when generating the paper return'
  },
  {
    match: 'system clock',
    description:
      'Notify rejected the request because at the time the system clock was not accurate to within 30 seconds'
  },
  {
    match: 'team-only API key',
    description: 'This notification was sent with a team-only API key'
  }
]

const NOTIFY_STATUS_DESCRIPTIONS = {
  email: {
    'permanent-failure': 'The provider could not deliver the message because the email address was wrong.',
    'technical-failure': 'The message was not sent because there was a problem between Notify and the provider.',
    'temporary-failure': `The provider could not deliver the message. This can happen when the recipient's inbox is full or their anti-spam filter rejects the email.`
  },
  letter: {
    'permanent-failure': 'The provider cannot print the letter. Your letter will not be dispatched.',
    'technical-failure': 'GOV.UK Notify had an unexpected error while sending the letter to our printing provider.',
    'validation-failed': `The precompiled letter failed validation likely due to an invalid address, though it could be due to content outside the printable area.`,
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
 * > When compiling this presenter we did confirm there are no notifications with a `notifyStatus` of 'delivered' or
 * > 'received' (which means it was successful) but a status of 'error'. Hence, that is not a scenario we cover.
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

  if (notifyStatus) {
    return {
      status: notifyStatus,
      description: NOTIFY_STATUS_DESCRIPTIONS[messageType][notifyStatus]
    }
  }

  return {
    status: 'Failed to send to Notify',
    description: _extractFromNotifyError(notifyError)
  }
}

function _extractFromNotifyError(notifyError) {
  if (!notifyError || notifyError === '') {
    return 'No error logged'
  }

  const matchedError = KNOWN_ERRORS.find((knownError) => {
    return notifyError.includes(knownError.match)
  })

  if (matchedError) {
    return matchedError.description
  }

  return 'Internal system error'
}

module.exports = {
  go
}
