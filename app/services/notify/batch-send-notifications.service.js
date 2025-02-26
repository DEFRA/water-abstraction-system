'use strict'

/**
 * Batch send notifications to Notify
 * @module BatchSendNotificationsService
 */

const NotifyEmailService = require('./notify-email.service.js')
const NotifyLetterService = require('./notify-letter.service.js')
const notifyRateLimit = 3000
const NotifyEmailPresenter = require('./notify-returns-email.presenter.js')
const NotifyLetterPresenter = require('./notify-returns-letter.presenter.js')

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

    // Journey -Send to notify
    const notifications = await _promiseSettled(recipients, returnsPeriod, referenceCode)
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

async function _sendLetter(recipient, returnsPeriod, referenceCode) {
  const formatedData = NotifyLetterPresenter.go(recipient, returnsPeriod, referenceCode)

  return NotifyLetterService.go(formatedData.templateId, formatedData.options).then((notifyData) => {
    return _scheduledNotification(notifyData, recipient, formatedData)
  })
}

async function _sendEmail(recipient, returnsPeriod, referenceCode) {
  const formatedData = NotifyEmailPresenter.go(recipient, returnsPeriod, referenceCode)

  return NotifyEmailService.go(formatedData.templateId, formatedData.emailAddress, formatedData.options).then(
    (notifyData) => {
      return _scheduledNotification(notifyData, recipient, formatedData)
    }
  )
}

function _scheduledNotification(notifyData, recipient, formatedData) {
  return {
    status: notifyData.status, // we might have our own internal statues
    id: notifyData.id, // notification id
    // other notify calls will not have a contact_hash_id so it does not make sense to pass this in as an arg
    contact_hash_id: recipient.contact_hash_id,
    personalisation: formatedData.options.personalisation
  }
}

async function _promiseSettled(recipients, returnsPeriod, referenceCode) {
  const notifications = []

  // Build an array of promises
  for (const recipient of recipients) {
    if (recipient.email) {
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
