'use strict'

/**
 * Formats recipients into scheduled notifications for a returns invitation or reminder
 * @module ScheduledNotificationsPresenter
 */

const { contactName, contactAddress } = require('../../crm.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Formats recipients into scheduled notifications for a returns invitation or reminder
 *
 * This function prepares data for both sending notifications via a notification service (e.g., Notify)
 * and storing scheduled notification records in a database (e.g., 'water.scheduled_notifications').
 * It aligns with legacy practices by including parts of the Notify payload and response directly
 * within the scheduled notification objects.
 *
 * The output of this function is designed to be used directly for both notification delivery and persistent storage.
 *
 * @param {object[]} recipients
 * @param {object} returnsPeriod - the return period including the endDate, startDate and dueDate
 * @param {string} referenceCode - the unique code used to group the notifications in notify
 * @param {string} journey - the journey should be either "reminders" or "invitations"
 *
 * @returns {object[]} - the recipients transformed into scheduled notifications
 */
function go(recipients, returnsPeriod, referenceCode, journey) {
  const scheduledNotifications = []

  for (const recipient of recipients) {
    if (recipient.email) {
      scheduledNotifications.push(_email(recipient, returnsPeriod, referenceCode, journey))
    } else {
      scheduledNotifications.push(_letter(recipient, returnsPeriod, referenceCode, journey))
    }
  }

  return scheduledNotifications
}

/**
 * Notify expects address lines to be formatted into: 'address_line_1'
 *
 * @private
 */
function _addressLines(contact) {
  const address = contactAddress(contact)

  const addressLines = {}

  for (const [index, value] of address.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

/**
 * An email notification requires an email address alongside the expected payload:
 *
 * ```javascript
 *   {
 *      emailAddress: 'hello@world.com
 *      options: {
 *       personalisation: {
 *         periodEndDate: '30th January 2021',
 *         periodStartDate: '1st January 2021',
 *         returnDueDate: '28 April 2025'
 *       },
 *       reference: 'ABC-123' // This will be the reference code we set when the session is initialised
 *     }
 *    }
 * ```
 *
 * A scheduled notification saves the 'emailAddress' as 'recipient' and so is used as the variables name.
 *
 * @private
 */
function _email(recipient, returnsPeriod, referenceCode, journey) {
  const templateId = _emailTemplate(recipient.contact_type, journey)

  return {
    licences: _licences(recipient.licence_refs),
    messageType: 'email',
    personalisation: {
      ..._returnsPeriod(returnsPeriod)
    },
    recipient: recipient.email,
    reference: referenceCode,
    templateId
  }
}

/**
 * When the 'contactType' is for both we do not have a template to send to so we default to the 'primary_user' template.
 *
 * @private
 */
function _emailTemplate(contactType, journey) {
  if (contactType === 'Returns agent') {
    return notifyTemplates.returns[journey].returnsAgentEmail
  }

  return notifyTemplates.returns[journey].primaryUserEmail
}

/**
 * A letter notification requires an address alongside the expected payload:
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *        //The address must have at least 3 lines.
 *        "address_line_1": "Amala Bird", // required string
 *        "address_line_2": "123 High Street", // required string
 *        "address_line_3": "Richmond upon Thames", // required string
 *        "address_line_4": "Middlesex",
 *        "address_line_5": "SW14 6BF",  // last line of address you include must be a postcode or a country name  outside the UK
 *        name: 'test', // matches the template placeholder {{ name }}
 *       },
 *       reference: 'ABC-123' // A unique identifier which identifies a single unique message or a batch of messages
 *     }
 * ```
 *
 * **The notify api has been updated to expect the
 * [postcode as the last address line.](https://docs.notifications.service.gov.uk/node.html#send-a-letter-arguments)**
 *
 * @private
 */
function _letter(recipient, returnsPeriod, referenceCode, journey) {
  const name = contactName(recipient.contact)

  const templateId = _letterTemplate(recipient.contact_type, journey)

  return {
    licences: _licences(recipient.licence_refs),
    messageType: 'letter',
    personalisation: {
      name,
      ..._addressLines(recipient.contact),
      ..._returnsPeriod(returnsPeriod)
    },
    reference: referenceCode,
    templateId
  }
}

/**
 * When the 'contactType' is for both we do not have a template to send to so we default to the 'Licence Holder' template.
 *
 * @private
 */
function _letterTemplate(contactType, journey) {
  if (contactType === 'Returns to') {
    return notifyTemplates.returns[journey].returnsToLetter
  }

  return notifyTemplates.returns[journey].licenceHolderLetter
}

function _returnsPeriod(returnsPeriod) {
  return {
    periodEndDate: formatLongDate(new Date(returnsPeriod.endDate)),
    periodStartDate: formatLongDate(new Date(returnsPeriod.startDate)),
    returnDueDate: formatLongDate(new Date(returnsPeriod.dueDate))
  }
}

/**
 * All the 'licences' associated with a notification are stored in 'water.scheduled_notifications'
 *
 * These licences are stored as 'jsonb' so we need to stringify the array to match the legacy schema.
 *
 * @private
 */
function _licences(licenceRefs) {
  const formattedRecipients = transformStringOfLicencesToArray(licenceRefs)

  return JSON.stringify(formattedRecipients)
}

module.exports = {
  go
}
