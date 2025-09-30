'use strict'

/**
 * Formats recipients into notifications for a returns invitation or reminder
 * @module NotificationsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { futureDueDate } = require('../base.presenter.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { transformStringOfLicencesToArray, timestampForPostgres } = require('../../../lib/general.lib.js')

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
  }
}

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
 * @param {object} session - The session instance
 * @param {string} eventId - the event id to link all the notifications to an event
 *
 * @returns {object[]} - the recipients transformed into notifications
 */
function go(recipients, session, eventId) {
  const notifications = []

  const { determinedReturnsPeriod, journey, noticeType } = session

  for (const recipient of recipients) {
    if (recipient.email) {
      notifications.push(_email(recipient, determinedReturnsPeriod, journey, eventId, noticeType))
    } else {
      notifications.push(_letter(recipient, determinedReturnsPeriod, journey, eventId, noticeType))
    }
  }

  return notifications
}

function _common(templateId, eventId) {
  const createdAt = timestampForPostgres()

  return {
    createdAt,
    eventId,
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
function _email(recipient, returnsPeriod, journey, eventId, noticeType) {
  const templateId = _emailTemplate(recipient.contact_type, journey, noticeType)

  const messageType = 'email'

  return {
    ..._common(templateId, eventId),
    licences: transformStringOfLicencesToArray(recipient.licence_refs),
    messageType,
    messageRef: _messageRef(noticeType, messageType, recipient.contact_type),
    personalisation: {
      ..._returnsPeriods(returnsPeriod, messageType)
    },
    recipient: recipient.email,
    status: 'pending'
  }
}

/**
 * When the 'contactType' is for both we do not have a template to send to so we default to the 'primary_user' template.
 *
 * @private
 */
function _emailTemplate(contactType, journey, noticeType) {
  if (contactType === 'Returns agent') {
    return notifyTemplates[journey][noticeType].returnsAgentEmail
  }

  return notifyTemplates[journey][noticeType].primaryUserEmail
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
function _letter(recipient, returnsPeriod, journey, eventId, noticeType) {
  const templateId = _letterTemplate(recipient.contact_type, journey, noticeType)
  const messageType = 'letter'
  const address = NotifyAddressPresenter.go(recipient.contact)

  return {
    ..._common(templateId, eventId),
    licences: transformStringOfLicencesToArray(recipient.licence_refs),
    messageType,
    messageRef: _messageRef(noticeType, messageType, recipient.contact_type),
    personalisation: {
      ...address,
      ..._returnsPeriods(returnsPeriod, messageType),
      // NOTE: Address line 1 is always set to the recipient's name
      name: address.address_line_1
    },
    status: 'pending'
  }
}

/**
 * When the 'contactType' is for both we do not have a template to send to so we default to the 'Licence Holder' template.
 *
 * @private
 */
function _letterTemplate(contactType, journey, noticeType) {
  if (contactType === 'Returns to') {
    return notifyTemplates[journey][noticeType].returnsToLetter
  }

  return notifyTemplates[journey][noticeType].licenceHolderLetter
}

/**
 * Determines the period start, end and due dates for an invitation and reminder notice
 *
 * On the standard returns invitation and reminder journeys, all 3 dates are determined. What period the user selects
 * will determine the actual dates used.
 *
 * For ad-hoc invitations we don't care about the start and end dates. But we do need to calculate a due date. This is
 * set in the future depending on the message type we are sending (letter or an email).
 *
 * > NOTE - Due date will soon be calculated for _all_ notices. But that dynamic due dates is still being refined and
 * > developed.
 *
 * @private
 */
function _returnsPeriods(returnsPeriod, messageType) {
  return {
    periodEndDate: formatLongDate(returnsPeriod?.endDate),
    periodStartDate: formatLongDate(returnsPeriod?.startDate),
    returnDueDate: formatLongDate(returnsPeriod?.dueDate) ?? formatLongDate(futureDueDate(messageType))
  }
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
function _messageRef(noticeType, messageType, contactType) {
  return MESSAGE_REFS[noticeType][messageType][contactType]
}

module.exports = {
  go
}
