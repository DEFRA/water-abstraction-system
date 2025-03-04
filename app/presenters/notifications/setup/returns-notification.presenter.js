'use strict'

/**
 * Formats recipients into notifications to send to notify for a returns invitation and reminder
 * @module ReturnsNotificationPresenter
 */

const { contactName, contactAddress } = require('../../crm.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')

/**
 * Formats recipients into notifications to send to notify for a returns invitation and reminder
 *
 * A returns invitation or reminder will need to send a letter or email to notify. The basic structure for a notify
 * payload looks like this:
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *         // All our returns templates expect at least these three dates
 *         periodEndDate: '30th January 2021',
 *         periodStartDate: '1st January 2021',
 *         returnDueDate: '28 April 2025'
 *       },
 *       reference: 'ABC-123' // This will be the reference code we set when the session is initialised
 *     }
 * ```
 *
 * @param {object[]} recipients
 * @param {object} returnsPeriod - the return period including the endDate, startDate and dueDate
 * @param {string} referenceCode - the unique code used to group the notifications in notify
 * @param {string} journey - the journey should be either "reminders" or "invitations"
 *
 * @returns {object[]} - the recipients transformed into notifications
 */
function go(recipients, returnsPeriod, referenceCode, journey) {
  const notifications = []

  for (const recipient of recipients) {
    if (recipient.email) {
      notifications.push(_email(recipient, returnsPeriod, referenceCode, journey))
    } else {
      notifications.push(_letter(recipient, returnsPeriod, referenceCode, journey))
    }
  }

  return notifications
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
 *   const options = {
 *       emailAddress: 'hello@world.com
 *       personalisation: {
 *         periodEndDate: '30th January 2021',
 *         periodStartDate: '1st January 2021',
 *         returnDueDate: '28 April 2025'
 *       },
 *       reference: 'ABC-123' // This will be the reference code we set when the session is initialised
 *     }
 * ```
 *
 * @private
 */
function _email(recipient, returnsPeriod, referenceCode, journey) {
  const templateId = _emailTemplate(recipient.contact_type, journey)

  return {
    templateId,
    emailAddress: recipient.email,
    options: {
      personalisation: {
        ..._returnsPeriod(returnsPeriod)
      },
      reference: referenceCode
    }
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
    templateId,
    options: {
      personalisation: {
        name,
        ..._addressLines(recipient.contact),
        ..._returnsPeriod(returnsPeriod)
      },
      reference: referenceCode
    }
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

module.exports = {
  go
}
