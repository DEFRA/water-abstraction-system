'use strict'

/**
 * Batch send notifications to Notify
 * @module BatchSendNotificationsService
 */

const NotifyEmailService = require('./notify-email.service.js')
const NotifyLetterService = require('./notify-letter.service.js')
const notifyRateLimit = 3000
const NotifyReturnsPresenter = require('./notify-returns.presenter.js')

/**
 *
 * @param recipients
 */
async function go(recipients) {
  try {
    const returnsPeriod = {
      periodEndDate: '28th January 2025',
      periodStartDate: '1st January 2025',
      returnDueDate: '28th April 2025'
    }

    const referenceCode = 'developer-testing'

    console.time('testTime')

    const formattedRecipients = NotifyReturnsPresenter.go(recipients, returnsPeriod, referenceCode)

    // Journey -Send to notify
    const notifications = await _promiseSettled(formattedRecipients, returnsPeriod, referenceCode)
    // Add to the scheduled notification table - with notification id

    // Get status ? - update in notification table

    // Add error handling
    _notificationErrors(notifications)

    console.timeEnd('testTime')

    // Stripe promise status "settled"
    return notifications.map((notification) => notification.value)
  } catch (e) {
    console.log(e)
  }
}

async function _sendLetter(recipient) {
  const notifyData = await NotifyLetterService.go(recipient.templateId, recipient.options)
  return _scheduledNotification(notifyData, recipient)
}

async function _sendEmail(recipient) {
  const notifyData = await NotifyEmailService.go(recipient.templateId, recipient.emailAddress, recipient.options)
  return _scheduledNotification(notifyData, recipient)
}

function _scheduledNotification(notifyData, recipient) {
  return {
    status: notifyData.status, // we might have our own internal statues ? look in legacy
    notificationId: notifyData.id,
    ...recipient
  }
}

async function _promiseSettled(recipients, returnsPeriod, referenceCode) {
  const notifications = []

  for (const recipient of recipients) {
    if (recipient.emailAddress) {
      notifications.push(_sendEmail(recipient, returnsPeriod, referenceCode))
    } else {
      notifications.push(_sendLetter(recipient, returnsPeriod, referenceCode))
    }
  }

  return Promise.allSettled(notifications)
}

function _notificationErrors(notifications) {
  const failed = notifications.filter((response) => response.status !== 'fulfilled')
  console.log('Failed: ', JSON.stringify(failed))

  const rateLimited = notifications.filter((response) => response.value.status === 429)
  console.log(`Failed rateLimited = ${rateLimited.length}`)
}

module.exports = {
  go
}
