'use strict'

/**
 * Formats recipients into notifications for a returns invitation or reminder
 * @module NotificationsPresenter
 */

const { contactName, contactAddress } = require('../../crm.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { transformStringOfLicencesToArray, timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Formats recipients into notifications for a returns invitation or reminder
 *
 * This function prepares data for both sending notifications via a notification service (e.g., Notify)
 * and storing notification records in a database (e.g., 'water.scheduled_notifications').
 * It aligns with legacy practices by including parts of the Notify payload and response directly
 * within the notification objects.
 *
 * The output of this function is designed to be used directly for both notification delivery and persistent storage.
 *
 * @param {object[]} recipients
 * @param {object} returnsPeriod - the return period including the endDate, startDate and dueDate
 * @param {string} referenceCode - the unique code used to group the notifications in notify
 * @param {string} journey - the journey should be one of "reminders", "invitations" or "ad-hoc"
 * @param {string} eventId - the event id to link all the notifications to an event
 *
 * @returns {object[]} - the recipients transformed into notifications
 */
function go(recipients, returnsPeriod, referenceCode, journey, eventId) {
  const notifications = []

  for (const recipient of recipients) {
    if (recipient.email) {
      notifications.push(_email(recipient, returnsPeriod, referenceCode, journey, eventId))
    } else {
      notifications.push(_letter(recipient, returnsPeriod, referenceCode, journey, eventId))
    }
  }

  return notifications
}

/**
 * Notify expects address lines to be formatted into: 'address_line_1'
 *
 * @private
 */
function _addressLines(contact, name) {
  const address = contactAddress(contact)

  const fullContact = [name, ...address]

  const addressLines = {}

  for (const [index, value] of fullContact.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

function _common(referenceCode, templateId, eventId) {
  const createdAt = timestampForPostgres()

  return {
    createdAt,
    eventId,
    reference: referenceCode,
    templateId
  }
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
 * A notification saves the 'emailAddress' as 'recipient' and so is used as the variables name.
 *
 * @private
 */
function _email(recipient, returnsPeriod, referenceCode, journey, eventId) {
  const templateId = _emailTemplate(recipient.contact_type, journey)

  const messageType = 'email'

  return {
    ..._common(referenceCode, templateId, eventId),
    licences: _licences(recipient.licence_refs),
    messageType,
    messageRef: _messageRef(journey, messageType, recipient.contact_type),
    personalisation: {
      ..._returnsPeriod(returnsPeriod)
    },
    recipient: recipient.email
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
function _letter(recipient, returnsPeriod, referenceCode, journey, eventId) {
  const name = contactName(recipient.contact)
  const templateId = _letterTemplate(recipient.contact_type, journey)

  const messageType = 'letter'

  return {
    ..._common(referenceCode, templateId, eventId),
    licences: _licences(recipient.licence_refs),
    messageType,
    messageRef: _messageRef(journey, messageType, recipient.contact_type),
    personalisation: {
      ..._addressLines(recipient.contact, name),
      ..._returnsPeriod(returnsPeriod),
      name
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

/**
 * The legacy code has the concept of 'message_refs' used to group different types of notifications. There are queries
 * which rely on checking this 'message_refs' as part of the fetch. We need to follow this pattern.
 *
 * As we have introduced the concept of 'both' for a 'contact_type' we use what we call the primary recipient for the
 * 'message_ref'. When the licence is 'registered' we use the 'Primary user', when the licence is 'unregistered' we use
 * the 'Licence holder'. This is consistent with other areas of our codebase (they use the same 'template_id').
 *
 * @private
 */
function _messageRef(journey, messageType, contactType) {
  const MESSAGE_REFS = {
    invitations: {
      email: {
        'Primary user': 'returns_invitation_primary_user_email',
        both: 'returns_invitation_primary_user_email',
        'Returns agent': 'returns_invitation_returns_agent_email'
      },
      letter: {
        'Licence holder': 'returns_invitation_licence_holder_letter',
        both: 'returns_invitation_licence_holder_letter',
        'Returns to': 'returns_invitation_returns_to_letter'
      }
    },
    reminders: {
      email: {
        'Primary user': 'returns_reminder_primary_user_email',
        both: 'returns_reminder_primary_user_email',
        'Returns agent': 'returns_reminder_returns_agent_email'
      },
      letter: {
        'Licence holder': 'returns_reminder_licence_holder_letter',
        both: 'returns_reminder_licence_holder_letter',
        'Returns to': 'returns_reminder_returns_to_letter'
      }
    },
    'ad-hoc': {
      email: {
        'Primary user': 'ad-hoc_primary_user_email',
        both: 'ad-hoc_primary_user_email',
        'Returns agent': 'ad-hoc_returns_agent_email'
      },
      letter: {
        'Licence holder': 'ad-hoc_licence_holder_letter',
        both: 'ad-hoc_licence_holder_letter',
        'Returns to': 'ad-hoc_returns_to_letter'
      }
    }
  }

  return MESSAGE_REFS[journey][messageType][contactType]
}

module.exports = {
  go
}
