'use strict'

/**
 * Send an email using GOV.UK Notify
 * @module BatchSendNotificationsService
 */

const NotifyEmailService = require('./notify-email.service.js')
const NotifyLetterService = require('./notify-letter.service.js')
const notifyRateLimit = 3000
const { notifyTemplates } = require('../../lib/notify-templates.lib.js')
const { contactName, contactAddress } = require('../../presenters/crm.presenter.js')

/**
 *
 * @param recipients
 */
async function go(recipients) {
  try {
    console.time('testTime')

    // Journey -Send to notify
    const notifications = await _promiseSettled(recipients)
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

function _formatEmail(recipient) {
  return {
    templateId: notifyTemplates.returns.invitations.primaryUserEmail,
    emailAddress: recipient.email,
    options: {
      personalisation: {
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'developer-testing'
    }
  }
}

function _formatLetter(recipient) {
  const name = contactName(recipient.contact)
  const address = contactAddress(recipient.contact)

  const addressLines = {}

  // FYI - The postcode personalisation argument has been replaced. If your template still uses postcode, Notify will treat it as the last line of the address.

  // address_line_1: 'Amala Bird', // required string
  // address_line_2: '123 High Street', // required string
  // address_line_3: 'Richmond upon Thames', // required string
  // address_line_4: 'Middlesex',
  // address_line_5: 'SW14 6BF', // last line of address you include must be a postcode or a country name  outside the UK
  for (const [index, value] of address.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return {
    templateId: notifyTemplates.returns.invitations.licenceHolderLetter,
    options: {
      personalisation: {
        name,
        ...addressLines,
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'developer-testing'
    }
  }
}

async function _sendLetter(recipient) {
  const data = _formatLetter(recipient)

  return NotifyLetterService.go(data.templateId, data.options).then((res) => {
    return {
      status: res.status,
      id: res.id,
      contact_hash_id: recipient.contact_hash_id,
      personalisation: data.options.personalisation
    }
  })
}

async function _sendEmail(recipient) {
  const data = _formatEmail(recipient)

  return NotifyEmailService.go(data.templateId, data.emailAddress, data.options).then((res) => {
    return {
      status: res.status,
      id: res.id,
      contact_hash_id: recipient.contact_hash_id,
      personalisation: data.options.personalisation
    }
  })
}

async function _promiseSettled(recipients) {
  const notifications = []

  // Build an array of promises
  for (const recipient of recipients) {
    if (recipient.email) {
      notifications.push(_sendEmail(recipient))
    } else {
      notifications.push(_sendLetter(recipient))
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
